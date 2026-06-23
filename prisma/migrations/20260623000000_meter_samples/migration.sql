-- CreateTable
CREATE TABLE "meter_samples" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "counter_kwh" DECIMAL(14,3) NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "read_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meter_samples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meter_samples_device_id_read_at_idx" ON "meter_samples"("device_id", "read_at");

-- AddForeignKey
ALTER TABLE "meter_samples" ADD CONSTRAINT "meter_samples_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "meter_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
