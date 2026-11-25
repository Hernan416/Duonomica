function fmt(n, decimals) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  const d = decimals === undefined ? 2 : decimals;
  return Number(n).toLocaleString('es-VE', { minimumFractionDigits: d, maximumFractionDigits: d });
}

const TEMAS = [
  { id: 't1', title: 'Tema I', subtitle: 'Principios generales de la Ingeniería Económica' },
  { id: 't2', title: 'Tema II', subtitle: 'Valor del Dinero en el Tiempo' },
];

const SIM_LEVELS = [
  {
    id: 's1',
    temaId: 't1',
    number: '01',
    icon: '🌱',
    title: 'Fundamentos de la Startup',
    subtitle: 'Toma decisiones estratégicas aplicando los 7 Principios de la IE',
    startCapital: 10000,
    isBoss: false,
    rounds: [
      {
        tag: 'Ronda 1 · ¿Qué es la IE?',
        title: 'Primer equipo de producción',
        scenario: 'Tu startup necesita una impresora industrial. Ingeniería propone el modelo Ultra-X ($9,000, tarda 8 años en recuperarse). Operaciones propone el modelo Pro-2 ($4,500, cumple la misma función y se recupera en 2 años).',
        options: [
          {
            label: 'Elegir el modelo Pro-2 ($4,500)',
            detail: 'Funcionalidad equivalente y recuperación rápida',
            impact: 1800,
            correct: true,
            explain: '¡Bien! La Ingeniería Económica busca la alternativa económicamente más conveniente entre opciones técnicamente viables (Blank & Tarquin).',
          },
          {
            label: 'Elegir el modelo Ultra-X ($9,000)',
            detail: 'Tecnología de punta sin importar el retorno',
            impact: -1500,
            correct: false,
            explain: 'Una solución técnicamente superior no siempre es económicamente viable. Desembolsaste capital de más sin retorno.',
          },
        ],
      },
      {
        tag: 'Ronda 2 · Principio 2',
        title: 'Centrarse en las diferencias',
        scenario: 'Comparas dos proveedores de nube (Cloud A y Cloud B). Ambos requieren el mismo salario de tu ingeniero DevOps ($1,200/mes). Cloud A cuesta $400/mes y Cloud B cuesta $280/mes con igual rendimiento.',
        options: [
          {
            label: 'Ignorar el salario común y elegir Cloud B ($280/mes)',
            detail: 'Ahorras $120/mes enfocándote en la diferencia',
            impact: 1440,
            correct: true,
            explain: 'Correcto (Principio 2): los costos comunes a todas las alternativas ($1,200/mes) se ignoran; solo importan las diferencias.',
          },
          {
            label: 'Elegir Cloud A porque tiene un contrato más largo',
            detail: 'Pagas $400/mes sin ventaja técnica',
            impact: -900,
            correct: false,
            explain: 'Al no centrarte en la diferencia de $120/mes, tu empresa pagó de más por el mismo servicio.',
          },
        ],
      },
      {
        tag: 'Ronda 3 · Principio 3',
        title: 'Punto de vista consistente',
        scenario: 'El gerente de Ventas pide comprar autos lujosos para su equipo porque mejora su imagen personal, aunque eso reduce la rentabilidad global de la empresa en $2,000.',
        options: [
          {
            label: 'Evaluar desde la perspectiva global de la empresa y rechazar el gasto',
            detail: 'Mantienes la rentabilidad corporativa',
            impact: 1200,
            correct: true,
            explain: '¡Exacto! El Principio 3 exige un punto de vista único y consistente (la empresa completa), evitando favoritismos departamentales.',
          },
          {
            label: 'Aprobar los autos para contentar al departamento de Ventas',
            detail: 'Priorizas un área sobre la empresa',
            impact: -1200,
            correct: false,
            explain: 'Cambiar de perspectiva genera decisiones sesgadas que destruyen valor para la organización.',
          },
        ],
      },
      {
        tag: 'Ronda 4 · Principio 5',
        title: 'Criterios relevantes e intangibles',
        scenario: 'Tienes dos ubicaciones para tu taller: Zona A ahorra $300 al año pero tiene altos robos y poca seguridad para el personal; Zona B cuesta $300 más al año pero es segura y accesible.',
        options: [
          {
            label: 'Elegir Zona B considerando la seguridad del personal',
            detail: 'Ponderas factores intangibles clave',
            impact: 1500,
            correct: true,
            explain: '¡Bien hecho! El Principio 5 recuerda que deben considerarse factores no monetarios relevantes como la seguridad y el impacto social.',
          },
          {
            label: 'Elegir Zona A solo por ahorrar $300',
            detail: 'Ignoras el riesgo de seguridad',
            impact: -1800,
            correct: false,
            explain: 'Ignorar criterios intangibles como la seguridad expuso a la empresa a pérdidas y rotación de personal.',
          },
        ],
      },
      {
        tag: 'Ronda 5 · Principio 7',
        title: 'Revisión post-implementación',
        scenario: 'Terminó tu primer trimestre. Un proyecto de marketing costó 25% más de lo estimado. ¿Qué haces antes de lanzar la siguiente campaña?',
        options: [
          {
            label: 'Auditar los resultados reales vs. proyectados para ajustar el modelo',
            detail: 'Aprendizaje y mejora continua',
            impact: 1600,
            correct: true,
            explain: '¡Excelente! El Principio 7 (Revisar las decisiones) convierte los desvíos en aprendizaje para mejorar futuras estimaciones.',
          },
          {
            label: 'Archivar el informe porque el dinero ya se gastó',
            detail: 'No aprendes de los errores',
            impact: -1000,
            correct: false,
            explain: 'Sin seguimiento posterior, la empresa repetirá los mismos errores de estimación en el futuro.',
          },
        ],
      },
    ],
  },
  {
    id: 's2',
    temaId: 't2',
    number: '02',
    icon: '🪙',
    title: 'Liquidez, Capital e Inflación',
    subtitle: 'Protege el poder adquisitivo y domina el Valor del Dinero en el Tiempo',
    startCapital: 15000,
    isBoss: false,
    rounds: [
      {
        tag: 'Ronda 1 · Dinero vs. Capital',
        title: 'Excedente en caja',
        scenario: 'Tienes $5,000 libres en la cuenta corriente sin generar intereses. Tu socio sugiere invertirlos en un certificado de inventario que rinde 12% anual.',
        options: [
          {
            label: 'Invertir los $5,000 en el inventario productivo (+12%)',
            detail: 'Transformas dinero ocioso en capital',
            impact: 1600,
            correct: true,
            explain: 'El dinero por sí solo no es capital; se convierte en capital al invertirse en una actividad que genera rendimiento.',
          },
          {
            label: 'Dejarlos en efectivo en la caja fuerte',
            detail: '0% de rendimiento',
            impact: -750,
            correct: false,
            explain: 'El dinero inmovilizado pierde poder adquisitivo frente a la inflación y no produce valor.',
          },
        ],
      },
      {
        tag: 'Ronda 2 · VDT e Inflación',
        title: 'Compra de servidores: ¿hoy o en 1 año?',
        scenario: 'Un servidor cuesta $2,000 hoy. El banco te paga 6% anual por ahorrar ese dinero, pero la inflación tecnológica proyectada es del 10% anual.',
        options: [
          {
            label: 'Comprar el servidor hoy por $2,000',
            detail: 'Evitas que suba a $2,200 mientras tu ahorro solo llega a $2,120',
            impact: 1400,
            correct: true,
            explain: '¡Exacto! Cuando la inflación (10%) supera la tasa de interés (6%), postergar la compra te hace perder $80 de poder adquisitivo.',
          },
          {
            label: 'Ahorrar en el banco al 6% y comprar en 1 año',
            detail: 'La inflación te alcanza',
            impact: -800,
            correct: false,
            explain: 'En 1 año tendrás $2,120 pero el servidor costará $2,200: te faltarán $80.',
          },
        ],
      },
      {
        tag: 'Ronda 3 · Costo de Oportunidad',
        title: 'Elección de proyecto',
        scenario: 'Puedes asignar a tu equipo a un contrato seguro que rinde 9% anual, o a un desarrollo propio que rinde 16% anual con riesgo controlado. Eliges el desarrollo propio.',
        options: [
          {
            label: 'Registrar el 9% sacrificado como tu Costo de Oportunidad',
            detail: 'Fijas tu TMAR por encima del 9%',
            impact: 1800,
            correct: true,
            explain: 'Correcto: el costo de oportunidad es el beneficio perdido de la siguiente mejor alternativa (9%) y sirve de base para tu TMAR.',
          },
          {
            label: 'Asumir que el costo de oportunidad es 0%',
            detail: 'Subestimas el piso de rendimiento',
            impact: -900,
            correct: false,
            explain: 'Ignorar el costo de oportunidad lleva a aceptar proyectos mediocres que rinden menos que alternativas seguras.',
          },
        ],
      },
      {
        tag: 'Ronda 4 · Interés Pagado',
        title: 'Evaluando un microcrédito',
        scenario: 'Un proveedor te presta $4,000 hoy y te exige devolver $4,600 en un año. Un banco te ofrece $4,000 al 11% anual. ¿Cuál eliges?',
        options: [
          {
            label: 'Elegir el banco (11% anual vs. 15% del proveedor)',
            detail: 'Ahorras 4% en tasa de interés pagado',
            impact: 1200,
            correct: true,
            explain: 'Con el proveedor: i = ($4,600 − $4,000) / $4,000 = 15%. El banco al 11% es más barato.',
          },
          {
            label: 'Elegir al proveedor ($4,600 en 1 año)',
            detail: 'Pagas 15% de interés',
            impact: -1100,
            correct: false,
            explain: 'El interés del proveedor era 15% ($600 / $4,000), superior al 11% bancario.',
          },
        ],
      },
      {
        tag: 'Ronda 5 · Tasa de Rendimiento',
        title: 'Retorno de campaña',
        scenario: 'Invertiste $3,000 en una línea exprés y al cabo de un año recibiste $3,600 en total. La TMAR de tu empresa es 15%. ¿Repites la inversión?',
        options: [
          {
            label: 'Sí, porque la TR fue 20% (> 15% de TMAR)',
            detail: 'I = $600 → TR = 600 / 3000 = 20%',
            impact: 2000,
            correct: true,
            explain: '¡Brillante! Ganaste $600 sobre $3,000, una Tasa de Rendimiento del 20%, superando la TMAR del 15%.',
          },
          {
            label: 'No, porque $600 parece poco dinero',
            detail: 'Rechazas una inversión altamente rentable',
            impact: -1200,
            correct: false,
            explain: 'En IE medimos rentabilidad porcentual frente a la TMAR: 20% > 15% es una excelente inversión.',
          },
        ],
      },
    ],
  },
  {
    id: 's3',
    temaId: 't2',
    number: '03',
    icon: '📈',
    title: 'Interés Compuesto y Equivalencia',
    subtitle: 'Domina el crecimiento exponencial y los planes de pago',
    startCapital: 20000,
    isBoss: false,
    rounds: [
      {
        tag: 'Ronda 1 · Simple vs. Compuesto',
        title: 'Fondo de reserva a 5 años',
        scenario: 'Vas a invertir $10,000 por 5 años. Banco Alfa ofrece 7.5% de interés SIMPLE anual. Banco Beta ofrece 7% de interés COMPUESTO anual.',
        options: [
          {
            label: 'Elegir Banco Beta (7% compuesto → $14,025.52)',
            detail: 'Supera al 7.5% simple ($13,750.00)',
            impact: 2200,
            correct: true,
            explain: '¡Excelente! Compuesto: $10,000(1.07)⁵ = $14,025.52. Simple: $10,000(1 + 0.075×5) = $13,750.00.',
          },
          {
            label: 'Elegir Banco Alfa (7.5% simple → $13,750)',
            detail: 'Te dejaste llevar por el 7.5% nominal',
            impact: -1100,
            correct: false,
            explain: 'En plazos largos, el interés compuesto ("interés sobre interés") supera a tasas simples ligeramente mayores.',
          },
        ],
      },
      {
        tag: 'Ronda 2 · Interés sobre Interés',
        title: 'Cálculo rápido de deuda',
        scenario: 'Tomaste $5,000 al 10% compuesto anual. Al final del año 1 no pagaste nada. ¿Sobre qué monto se calcula el interés del año 2?',
        options: [
          {
            label: 'Sobre $5,500 (capital + interés del año 1)',
            detail: 'El interés del año 2 será $550',
            impact: 1500,
            correct: true,
            explain: 'En interés compuesto el interés de cada periodo se calcula sobre el capital inicial más los intereses acumulados.',
          },
          {
            label: 'Sobre los $5,000 iniciales',
            detail: 'Eso sería interés simple',
            impact: -900,
            correct: false,
            explain: 'Calcular siempre sobre $5,000 corresponde al interés simple, no al compuesto.',
          },
        ],
      },
      {
        tag: 'Ronda 3 · Equivalencia Económica',
        title: 'Elige tu plan de financiamiento',
        scenario: 'Necesitas $5,000 a 5 años al 8% anual y tienes flujo de caja estable. ¿Qué plan minimiza el total de intereses pagados en dólares?',
        options: [
          {
            label: 'Plan 4: Abonar $1,000 de principal + intereses cada año ($6,200 total)',
            detail: 'Reduces la deuda desde el año 1',
            impact: 2000,
            correct: true,
            explain: '¡Exacto! Al amortizar parte del capital cada año, el saldo pendiente baja más rápido y pagas menos intereses totales.',
          },
          {
            label: 'Plan 2: Interés compuesto pagando todo al año 5 ($7,346.64 total)',
            detail: 'Pagas $1,146.64 adicionales en intereses',
            impact: -1400,
            correct: false,
            explain: 'Postergar todo hasta el año 5 acumula intereses compuestos sobre el 100% del préstamo durante 5 años.',
          },
        ],
      },
      {
        tag: 'Ronda 4 · Equivalencia',
        title: '¿Son equivalentes los planes?',
        scenario: 'Un socio dice que el Plan 1 ($7,000) y el Plan 5 ($6,261.41 en cuotas iguales) no corresponden al mismo préstamo de $5,000 al 8%. ¿Qué respondes?',
        options: [
          {
            label: 'Sí son equivalentes a esa tasa: cambian los montos nominales por el momento del pago',
            detail: 'El valor del dinero en el tiempo explica la diferencia',
            impact: 1400,
            correct: true,
            explain: 'Correcto: la equivalencia depende de la tasa i, los montos y el momento en que ocurren los flujos.',
          },
          {
            label: 'No son equivalentes; el banco cometió un error',
            detail: 'Ignoras el efecto del tiempo en el dinero',
            impact: -800,
            correct: false,
            explain: 'Ambos planes liquidan exactamente $5,000 en 5 años; la diferencia se debe al calendario de amortización.',
          },
        ],
      },
      {
        tag: 'Ronda 5 · Aplicación práctica',
        title: 'Renovación de flota',
        scenario: 'Tienes $8,000 disponibles al 5% compuesto anual durante 3 años para comprar una camioneta. ¿Con cuánto contarás al final del año 3?',
        options: [
          {
            label: '$9,261.00  →  $8,000 × (1.05)³',
            detail: 'Proyección exacta con interés compuesto',
            impact: 1900,
            correct: true,
            explain: '¡Perfecto! F = $8,000 × (1.05)³ = $8,000 × 1.157625 = $9,261.00.',
          },
          {
            label: '$9,200.00  →  $8,000 + $400 × 3',
            detail: 'Usaste interés simple por error',
            impact: -1000,
            correct: false,
            explain: '$9,200 sería el resultado con interés simple; con interés compuesto es $9,261.00.',
          },
        ],
      },
    ],
  },
  {
    id: 's4',
    temaId: 't2',
    number: '04',
    icon: '📊',
    title: 'Flujos de Caja y Pago Único',
    subtitle: 'Diagramas de flujo, FEN y factores F/P y P/F',
    startCapital: 26000,
    isBoss: false,
    rounds: [
      {
        tag: 'Ronda 1 · Flujo de Efectivo Neto',
        title: 'Evaluando una nueva sucursal',
        scenario: 'La sucursal proyecta ingresos de $5,310/año y gastos operativos de $3,000/año. En el año 5 tendrá un valor de rescate de $2,000. ¿Cuál es el FEN del año 5?',
        options: [
          {
            label: '+$4,310  ($5,310 − $3,000 + $2,000)',
            detail: 'Incluye el valor de rescate al cierre',
            impact: 2100,
            correct: true,
            explain: '¡Exacto (Ejemplo 2.6)! FEN año 5 = Ingresos ($5,310) + Rescate ($2,000) − Gastos ($3,000) = +$4,310.',
          },
          {
            label: '+$2,310 (olvidas el valor de rescate)',
            detail: 'Subestimas el flujo del último año',
            impact: -1200,
            correct: false,
            explain: 'El valor de salvamento o rescate es una entrada de efectivo clave en el último periodo.',
          },
        ],
      },
      {
        tag: 'Ronda 2 · Convención de Diagrama',
        title: 'Lectura del diagrama de flujo',
        scenario: 'En el diagrama de tu proyecto, la inversión inicial de $10,000 en t = 0 aparece como una flecha hacia abajo. ¿Qué significa?',
        options: [
          {
            label: 'Que es un egreso (salida de efectivo) en el momento presente',
            detail: 'Convención estándar desde la vista de la empresa',
            impact: 1300,
            correct: true,
            explain: 'Correcto: t = 0 es el presente y las flechas hacia abajo representan egresos o salidas de dinero.',
          },
          {
            label: 'Que es una ganancia inmediata',
            detail: 'Confundes ingresos con egresos',
            impact: -900,
            correct: false,
            explain: 'Las entradas/ingresos se dibujan con flechas hacia arriba; las salidas/egresos hacia abajo.',
          },
        ],
      },
      {
        tag: 'Ronda 3 · Factor F/P',
        title: 'Reserva a 8 años',
        scenario: 'Inviertes $1,000 de utilidades hoy al 7% compuesto anual durante 8 años (factor F/P(7%, 8) = 1.7182). ¿Cuánto tendrás?',
        options: [
          {
            label: '$1,718.20  (Proceso de capitalización)',
            detail: 'Multiplicas P por (F/P, 7%, 8)',
            impact: 1800,
            correct: true,
            explain: '¡Correcto (Ejemplo 2.7)! F = $1,000 × 1.7182 = $1,718.20.',
          },
          {
            label: '$1,560.00',
            detail: 'Cálculo lineal incorrecto',
            impact: -1000,
            correct: false,
            explain: 'Con capitalización compuesta al 7% por 8 años se obtiene $1,718.20, no $1,560.',
          },
        ],
      },
      {
        tag: 'Ronda 4 · Factor P/F',
        title: 'Compra de bono cupón cero',
        scenario: 'Te ofrecen un bono que pagará $1,000 dentro de 8 años. Si bonos similares rinden 6% anual (factor P/F(6%, 8) = 0.6274), ¿cuál es el precio máximo justo a pagar hoy?',
        options: [
          {
            label: '$627.40  (Proceso de descuento)',
            detail: 'P = $1,000 × 0.6274',
            impact: 1900,
            correct: true,
            explain: '¡Excelente (Ejemplo 2.8)! Descontar el futuro al presente da P = $627.40.',
          },
          {
            label: '$850.00',
            detail: 'Pagas demasiado por el bono',
            impact: -1400,
            correct: false,
            explain: 'Pagar $850 por recibir $1,000 en 8 años rendiría mucho menos que el 6% de mercado.',
          },
        ],
      },
      {
        tag: 'Ronda 5 · Despeje de N',
        title: 'Meta de duplicar acciones',
        scenario: 'Invertiste $3,000 en acciones que crecen al 12% anual. ¿En cuántos años aproximadamente se duplicarán a $6,000?',
        options: [
          {
            label: '6.12 años  →  N = log(2) / log(1.12)',
            detail: 'Cálculo logarítmico exacto',
            impact: 2000,
            correct: true,
            explain: '¡Brillante (Ejemplo 2.10)! N = log(2) / log(1.12) ≈ 6.116 años.',
          },
          {
            label: '8.33 años  →  100% / 12%',
            detail: 'Usaste interés simple',
            impact: -1000,
            correct: false,
            explain: '8.33 años sería sin reinversión compuesta; con interés compuesto se duplica en 6.12 años.',
          },
        ],
      },
    ],
  },
  {
    id: 's5',
    temaId: 't2',
    number: '05',
    icon: '🏦',
    title: 'Expansión con Anualidades',
    subtitle: 'Series uniformes (F/A, P/A, A/F, A/P) y tipos de renta',
    startCapital: 34000,
    isBoss: false,
    rounds: [
      {
        tag: 'Ronda 1 · Factor P/A',
        title: 'Reparación mayor de planta',
        scenario: 'Reparar una máquina generará $20,000 adicionales al final de cada año durante 5 años. Con i = 15% anual (P/A(15%, 5) = 3.3522), ¿hasta cuánto es razonable invertir hoy?',
        options: [
          {
            label: 'Hasta $67,044  ($20,000 × 3.3522)',
            detail: 'Valor presente de los flujos futuros',
            impact: 2400,
            correct: true,
            explain: '¡Exacto (Ejemplo 2.12)! Invertir más de $67,044 no recuperaría el costo de oportunidad del 15%.',
          },
          {
            label: 'Hasta $100,000 ($20,000 × 5)',
            detail: 'Ignoraste el descuento temporal',
            impact: -1800,
            correct: false,
            explain: 'Sumar $20,000 × 5 sin descontar al 15% sobrevalora el proyecto.',
          },
        ],
      },
      {
        tag: 'Ronda 2 · Factor A/F',
        title: 'Fondo de amortización',
        scenario: 'Necesitas reunir $100,000 dentro de 8 años para automatizar tu bodega, en una cuenta al 7% anual (A/F(7%, 8) = 0.0975). ¿Cuánto depositas cada fin de año?',
        options: [
          {
            label: '$9,750 al año  ($100,000 × 0.0975)',
            detail: 'Los intereses ayudan a completar la meta',
            impact: 2000,
            correct: true,
            explain: '¡Bien! Con el factor de fondo de amortización solo necesitas aportar $9,750 anuales.',
          },
          {
            label: '$12,500 al año ($100,000 / 8)',
            detail: 'Desaprovechas el interés compuesto',
            impact: -1100,
            correct: false,
            explain: 'Aportar $12,500/año inmoviliza más capital del necesario porque no cuenta los intereses ganados.',
          },
        ],
      },
      {
        tag: 'Ronda 3 · Renta Vencida vs. Anticipada',
        title: 'Contrato de alquiler de oficina',
        scenario: 'Te ofrecen alquilar un local por 12 meses con tasa 2.5% mensual: Opción A = $25,000 al FINAL de cada mes (P = $256,445). Opción B = $26,000 al INICIO de cada mes (P = $273,370).',
        options: [
          {
            label: 'Elegir Opción A (Vencida) y ahorrar $16,925 en valor presente',
            detail: 'Menor valor presente de salida',
            impact: 2500,
            correct: true,
            explain: '¡Excelente (Ejemplo 2.18)! Al pagar al final del mes y con cuota menor, la Opción A tiene menor costo presente.',
          },
          {
            label: 'Elegir Opción B (Anticipada)',
            detail: 'Pagas más y por adelantado',
            impact: -1600,
            correct: false,
            explain: 'La renta anticipada se multiplica por (1 + i), elevando aún más su valor presente de costo.',
          },
        ],
      },
      {
        tag: 'Ronda 4 · Renta Diferida',
        title: 'Proyecto con construcción previa',
        scenario: 'Una nueva línea generará $80,000/año por 5 años, pero tras 3 años de construcción (k = 3). Con i = 12%, P₃ = $288,384. ¿Cuál es el valor presente hoy en t = 0?',
        options: [
          {
            label: '$205,271.73  →  $288,384 × (1.12)⁻³',
            detail: 'Descuentas los 3 años de gracia hasta t = 0',
            impact: 2200,
            correct: true,
            explain: '¡Exacto (Ejemplo 2.17)! En una anualidad diferida se trae P₃ al presente descontando k periodos: (1 + i)⁻ᵏ.',
          },
          {
            label: '$288,384.00 (no descuentas los 3 años)',
            detail: 'Confundes P₃ con P₀',
            impact: -1500,
            correct: false,
            explain: '$288,384 es el valor en el año 3; para compararlo hoy debe descontarse 3 años más.',
          },
        ],
      },
      {
        tag: 'Ronda 5 · Factor A/P',
        title: 'Cuota de financiamiento',
        scenario: 'Pides $50,000 a 12 meses al 2% mensual (P/A(2%, 12) = 10.5753). ¿Cuál será la cuota mensual fija que debes presupuestar?',
        options: [
          {
            label: '$4,728.01 / mes  ($50,000 / 10.5753)',
            detail: 'Presupuesto exacto de flujo de caja',
            impact: 2000,
            correct: true,
            explain: '¡Perfecto (Ejemplo 2.15)! A = $50,000 / 10.5753 = $4,728.01 mensuales.',
          },
          {
            label: '$4,166.67 / mes ($50,000 / 12)',
            detail: 'Olvidaste incluir los intereses del 2% mensual',
            impact: -1300,
            correct: false,
            explain: 'Dividir entre 12 ignora la tasa del 2% mensual y dejaría tu presupuesto corto.',
          },
        ],
      },
    ],
  },
  {
    id: 's6',
    temaId: 't2',
    number: 'BOSS',
    icon: '👑',
    title: 'Boss Final: Junta de Inversionistas',
    subtitle: 'Aplica VPN, TIR, TMAR y todo lo aprendido para coronarte CFO Maestro',
    startCapital: 45000,
    isBoss: true,
    rounds: [
      {
        tag: 'Boss Ronda 1 · Criterio VPN',
        title: 'Proyecto de automatización',
        scenario: 'Una máquina cuesta $5,000 hoy y genera $2,000 al final de cada uno de los próximos 3 años. La TMAR de la junta es 10% anual (VPN = −$26.30). ¿Qué recomiendas?',
        options: [
          {
            label: 'Rechazar la máquina porque su VPN es negativo (−$26.30)',
            detail: 'No alcanza el rendimiento mínimo del 10%',
            impact: 3000,
            correct: true,
            explain: '¡Decisión de CFO! Aunque genera $6,000 brutos, descontados al 10% valen $4,973.70 (< $5,000). VPN < 0 se rechaza.',
          },
          {
            label: 'Aprobarla porque $6,000 > $5,000',
            detail: 'Ignoraste el valor del dinero en el tiempo',
            impact: -2500,
            correct: false,
            explain: 'Comparar $6,000 futuros con $5,000 presentes sin descontar a la TMAR destruye valor.',
          },
        ],
      },
      {
        tag: 'Boss Ronda 2 · VPN Positivo',
        title: 'Expansión regional',
        scenario: 'Un proyecto requiere $10,000 hoy y genera $4,000/año durante 4 años con TMAR = 8% (P/A(8%, 4) = 3.3121). ¿Cuál es el VPN y la decisión?',
        options: [
          {
            label: 'Aprobar: VPN = +$3,248.51 (> 0)',
            detail: 'Crea $3,248.51 de valor presente neto',
            impact: 3500,
            correct: true,
            explain: '¡Exacto! VPN = −$10,000 + $4,000(3.3121) = +$3,248.51. Al ser positivo, supera la TMAR y crea riqueza.',
          },
          {
            label: 'Rechazar porque tarda 2.5 años en recuperarse',
            detail: 'Descartas un proyecto altamente rentable',
            impact: -2000,
            correct: false,
            explain: 'El proyecto tiene un VPN positivo de +$3,248.51 por encima del 8% exigido.',
          },
        ],
      },
      {
        tag: 'Boss Ronda 3 · TIR vs. TMAR',
        title: 'Duelo de tasas',
        scenario: 'Tienes dos proyectos mutuamente excluyentes: Proyecto Alfa tiene TIR = 14% y Proyecto Beta tiene TIR = 9%. La TMAR corporativa es 12%.',
        options: [
          {
            label: 'Aceptar solo Proyecto Alfa (TIR 14% > TMAR 12%) y rechazar Beta',
            detail: 'Solo inviertes por encima del costo de capital',
            impact: 3200,
            correct: true,
            explain: '¡Correcto! Un proyecto es aceptable cuando TIR ≥ TMAR. Beta (9% < 12%) destruiría valor.',
          },
          {
            label: 'Aceptar ambos porque ambos tienen TIR positiva',
            detail: 'Beta rinde menos que tu costo de capital',
            impact: -2200,
            correct: false,
            explain: 'Una TIR de 9% cuando el capital cuesta 12% significa pérdida económica real.',
          },
        ],
      },
      {
        tag: 'Boss Ronda 4 · Flujo Integrado',
        title: 'Proyecto con espera y rescate',
        scenario: 'Un megaproyecto tiene inversión inicial en t = 0, periodo de construcción sin ingresos por 2 años (diferido), ingresos netos en años 3–6 y valor de rescate en año 6. ¿Cómo evalúas su viabilidad?',
        options: [
          {
            label: 'Descontar los flujos anuales a t = 2 con P/A, traerlos a t = 0 con (1+i)⁻², sumar rescate descontado y restar I₀',
            detail: 'Cálculo riguroso de VPN para anualidad diferida',
            impact: 3800,
            correct: true,
            explain: '¡Maestría total! Integras diferimiento, serie uniforme, valor de rescate y VPN en un solo modelo consistente.',
          },
          {
            label: 'Sumar todos los ingresos sin descontar y restar I₀',
            detail: 'Error grave de equivalencia temporal',
            impact: -2500,
            correct: false,
            explain: 'No puedes sumar dólares de distintos años sin llevarlos a una misma fecha focal (t = 0).',
          },
        ],
      },
      {
        tag: 'Boss Ronda 5 · Decisión Final',
        title: 'La oferta final de la Junta',
        scenario: 'La Junta te ofrece dos contratos finales: Contrato X da $100,000 hoy (VPN = +$18,000 sobre TMAR). Contrato Y da un prestigio enorme pero VPN = −$4,500 y riesgo alto no cuantificado.',
        options: [
          {
            label: 'Elegir Contrato X (+$18,000 VPN), haciendo explícita la incertidumbre y revisando resultados',
            detail: 'Combina rentabilidad positiva y gestión de riesgos',
            impact: 5000,
            correct: true,
            explain: '¡FELICITACIONES, CFO MAESTRO! Aplicaste los Principios de la IE, VDT, Equivalencia, Flujos, VPN y TIR para llevar tu empresa a la cima.',
          },
          {
            label: 'Elegir Contrato Y por prestigio ignorando el VPN negativo',
            detail: 'Pérdida económica para los accionistas',
            impact: -3000,
            correct: false,
            explain: 'Un buen CFO nunca sacrifica la viabilidad financiera (VPN < 0) por un riesgo no gestionado.',
          },
        ],
      },
    ],
  },
];
