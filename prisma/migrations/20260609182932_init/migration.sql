-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('shelly', 'tuya', 'ewelink');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('open', 'processing', 'pending_review', 'approved', 'exported', 'failed');

-- CreateTable
CREATE TABLE "building_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "building_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "building_admin_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "distribuidora" TEXT NOT NULL,
    "export_profile" TEXT NOT NULL DEFAULT 'generic',
    "timezone" TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "owner_name" TEXT,
    "external_ref" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cloud_connections" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "label" TEXT,
    "encrypted_credentials" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cloud_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meter_devices" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "provider_device_id" TEXT NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "meter_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tariffs" (
    "id" TEXT NOT NULL,
    "distribuidora" TEXT NOT NULL,
    "price_per_kwh" DECIMAL(12,6) NOT NULL,
    "margin" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "effective_from" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tariffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_periods" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT 'open',
    "period_start" TIMESTAMPTZ NOT NULL,
    "period_end" TIMESTAMPTZ NOT NULL,
    "processed_at" TIMESTAMPTZ,
    "approved_at" TIMESTAMPTZ,
    "error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "billing_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meter_readings" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "kwh_consumed" DECIMAL(12,3) NOT NULL,
    "counter_start" DECIMAL(14,3),
    "counter_end" DECIMAL(14,3),
    "raw_payload" JSONB NOT NULL,
    "read_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_lines" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "concept" TEXT NOT NULL DEFAULT 'Carga vehiculo electrico',
    "kwh" DECIMAL(12,3) NOT NULL,
    "price_per_kwh" DECIMAL(12,6) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "detail" TEXT,
    "tariff_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "billing_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "output_files" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "content_type" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "output_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "building_admin_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "building_admins_email_key" ON "building_admins"("email");

-- CreateIndex
CREATE INDEX "buildings_building_admin_id_idx" ON "buildings"("building_admin_id");

-- CreateIndex
CREATE INDEX "units_building_id_idx" ON "units"("building_id");

-- CreateIndex
CREATE INDEX "cloud_connections_building_id_idx" ON "cloud_connections"("building_id");

-- CreateIndex
CREATE INDEX "meter_devices_unit_id_idx" ON "meter_devices"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "meter_devices_connection_id_provider_device_id_key" ON "meter_devices"("connection_id", "provider_device_id");

-- CreateIndex
CREATE INDEX "tariffs_distribuidora_effective_from_idx" ON "tariffs"("distribuidora", "effective_from");

-- CreateIndex
CREATE INDEX "billing_periods_status_idx" ON "billing_periods"("status");

-- CreateIndex
CREATE UNIQUE INDEX "billing_periods_building_id_year_month_key" ON "billing_periods"("building_id", "year", "month");

-- CreateIndex
CREATE INDEX "meter_readings_device_id_idx" ON "meter_readings"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "meter_readings_period_id_device_id_key" ON "meter_readings"("period_id", "device_id");

-- CreateIndex
CREATE INDEX "billing_lines_unit_id_idx" ON "billing_lines"("unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_lines_period_id_unit_id_key" ON "billing_lines"("period_id", "unit_id");

-- CreateIndex
CREATE INDEX "output_files_period_id_idx" ON "output_files"("period_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_building_admin_id_idx" ON "audit_log"("building_admin_id");

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_building_admin_id_fkey" FOREIGN KEY ("building_admin_id") REFERENCES "building_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cloud_connections" ADD CONSTRAINT "cloud_connections_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_devices" ADD CONSTRAINT "meter_devices_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_devices" ADD CONSTRAINT "meter_devices_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "cloud_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_periods" ADD CONSTRAINT "billing_periods_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "billing_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meter_readings" ADD CONSTRAINT "meter_readings_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "meter_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_lines" ADD CONSTRAINT "billing_lines_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "billing_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_lines" ADD CONSTRAINT "billing_lines_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_lines" ADD CONSTRAINT "billing_lines_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "tariffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "output_files" ADD CONSTRAINT "output_files_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "billing_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_building_admin_id_fkey" FOREIGN KEY ("building_admin_id") REFERENCES "building_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
