import { Button } from "@/components/ds/Button";
import { ArrowRight, FileDown, Gauge, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="evon-mkt">
      <nav className="evon-mkt__nav">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/evon-logo.svg" alt="Evon" height={26} />
        <div className="evon-mkt__nav-links">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#piloto">Piloto</a>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Ingresar
            </Button>
          </Link>
        </div>
      </nav>

      <section className="evon-mkt__hero">
        <div>
          <span className="evon-mkt__pill">
            <Zap size={13} strokeWidth={2.4} /> B2B · Administradores de
            consorcios
          </span>
          <p className="evon-mkt__eyebrow">Evon</p>
          <h1 className="evon-mkt__title">
            El consumo de carga, en la expensa.
          </h1>
          <p className="evon-mkt__sub">
            Evon lee los kWh del disyuntor de cada cochera, aplica la tarifa de
            EDESUR/EDENOR y te entrega un CSV listo para importar en tu software
            de expensas. El vecino no hace nada. Vos importás un archivo.
          </p>
          <div className="evon-mkt__cta">
            <Link href="/dashboard">
              <Button iconRight={<ArrowRight size={17} strokeWidth={1.9} />}>
                Probar el panel
              </Button>
            </Link>
            <a href="#piloto">
              <Button variant="secondary">Hablar con ventas</Button>
            </a>
          </div>
        </div>

        <div className="evon-mkt__art" aria-hidden="true">
          <h3>expensas-junio.csv</h3>
          <div className="evon-mkt__row">
            <span>UF 3.º B · shelly-1a2b</span>
            <span>148,6 kWh</span>
          </div>
          <div className="evon-mkt__row">
            <span>UF 5.º A · sonoff-9f3c</span>
            <span>92,0 kWh</span>
          </div>
          <div className="evon-mkt__row">
            <span>UF 7.º D · shelly-4c5e</span>
            <span>90,7 kWh</span>
          </div>
          <div className="evon-mkt__total">
            <span>Total · 46 UF</span>
            <b>$ 1.482.560</b>
          </div>
        </div>
      </section>

      <section className="evon-mkt__feats" id="como-funciona">
        <div className="evon-mkt__feats-inner">
          <div className="evon-mkt__feat">
            <span className="evon-mkt__feat-ic">
              <Gauge size={20} strokeWidth={1.9} />
            </span>
            <h4>Lectura automática</h4>
            <p>
              Evon se conecta al cloud del fabricante del disyuntor (Shelly,
              Sonoff, Tuya) y lee los kWh acumulados de cada cochera el día 1 de
              cada mes.
            </p>
          </div>
          <div className="evon-mkt__feat">
            <span className="evon-mkt__feat-ic">
              <FileDown size={20} strokeWidth={1.9} />
            </span>
            <h4>CSV listo para importar</h4>
            <p>
              Aplicamos la tarifa de EDESUR/EDENOR más el margen del consorcio y
              generamos un CSV compatible con Octopus, ConsorcioAbierto o
              AdminProp.
            </p>
          </div>
          <div className="evon-mkt__feat">
            <span className="evon-mkt__feat-ic">
              <ShieldCheck size={20} strokeWidth={1.9} />
            </span>
            <h4>Cobranza fácil</h4>
            <p>
              El cargo aparece como una línea más en la expensa. Tu software de
              expensas lo cobra por los canales habituales: MercadoPago, MODO,
              RapiPago, débito.
            </p>
          </div>
        </div>
      </section>

      <footer className="evon-mkt__foot" id="piloto">
        <span>© 2026 Evon. Buenos Aires, Argentina.</span>
        <span>piloto@evon.com.ar</span>
      </footer>
    </main>
  );
}
