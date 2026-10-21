function fmt(n, decimals) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  const d = decimals === undefined ? 2 : decimals;
  return Number(n).toLocaleString('es-VE', { minimumFractionDigits: d, maximumFractionDigits: d });
}

const TEMAS = [
  { id: 't1', title: 'Tema I', subtitle: 'Principios generales de la Ingeniería Económica' },
  { id: 't2', title: 'Tema II', subtitle: 'Valor del Dinero en el Tiempo' },
];

const LESSONS = [
  {
    id: 'l1', temaId: 't1', icon: '📘', title: '¿Qué es la IE?',
    exercises: [
      { type: 'mc', question: 'Rama que aplica principios económicos y financieros para la toma de decisiones en proyectos de ingeniería y gestión.',
        options: ['Ingeniería Económica', 'Contabilidad de Costos', 'Macroeconomía', 'Auditoría Financiera'], answer: 0 },
      { type: 'fib', text: 'Según Baca Urbina (2010), la Ingeniería Económica se centra en la evaluación de proyectos de {{0}}, considerando la disponibilidad de capital, la rentabilidad y los riesgos.',
        blanks: ['inversión'], bank: ['inversión', 'producción', 'mercado', 'personal'] },
      { type: 'mc', question: 'Según Park (2011), ¿cuál es el objetivo de la Ingeniería Económica?',
        options: [
          'Apoyar la toma de decisiones mediante la comparación económica de alternativas que compiten por recursos limitados.',
          'Maximizar las ventas de la empresa en el corto plazo.',
          'Reducir la plantilla de personal para ahorrar costos.',
          'Calcular el impuesto sobre la renta de los empleados.'
        ], answer: 0 },
      { type: 'mc', question: '¿Qué abarca el alcance de la Ingeniería Económica?',
        options: [
          'La medición de la rentabilidad de un proyecto: valor actual, series uniformes y flujos de fondos.',
          'El diseño estructural de edificaciones.',
          'La gestión del talento humano de la organización.',
          'El control de calidad de los productos terminados.'
        ], answer: 0 },
      { type: 'fib', text: 'La Ingeniería Económica transforma la toma de decisiones, que a menudo es reactiva, en una gestión estratégica {{0}}.',
        blanks: ['proactiva'], bank: ['proactiva', 'pasiva', 'improvisada', 'reactiva'] },
    ],
  },
  {
    id: 'l2', temaId: 't1', icon: '🧩', title: 'Conceptos clave',
    exercises: [
      { type: 'match', pairs: [
        { left: 'VDT', right: 'Una unidad monetaria hoy vale más que en el futuro' },
        { left: 'Tasa de Interés (i)', right: 'Costo de pedir dinero prestado o recompensa por invertirlo' },
        { left: 'Flujos de Efectivo (FE)', right: 'Entradas y salidas de dinero a lo largo del proyecto' },
        { left: 'TMAR', right: 'Tasa mínima aceptable de rendimiento de un proyecto' },
      ]},
      { type: 'mc', question: '¿Cómo se llama al beneficio que se pierde al elegir una alternativa sobre la siguiente mejor opción disponible?',
        options: ['Costo de Oportunidad', 'Costo de Capital', 'Valor de Salvamento', 'Costo Hundido'], answer: 0 },
      { type: 'mc', question: 'Concepto que permite comparar sumas de dinero en diferentes momentos del tiempo, utilizando una tasa de interés específica.',
        options: ['Equivalencia Económica', 'Depreciación', 'Inflación', 'Liquidez'], answer: 0 },
      { type: 'fib', text: 'La Tasa de Rendimiento (TR) es la ganancia generada por una inversión, expresada como un {{0}} del capital inicial.',
        blanks: ['porcentaje'], bank: ['porcentaje', 'múltiplo', 'descuento', 'promedio'] },
      { type: 'match', pairs: [
        { left: 'P', right: 'Valor Presente' },
        { left: 'F', right: 'Valor Futuro' },
        { left: 'i', right: 'Tasa de Interés' },
        { left: 'A', right: 'Anualidad / Serie Uniforme' },
      ]},
    ],
  },
  {
    id: 'l3', temaId: 't1', icon: '🧭', title: '7 Principios de la IE',
    exercises: [
      { type: 'fib', text: 'El primer principio de la IE consiste en {{0}} las alternativas, ya que la calidad de la decisión final depende de la diversidad de opciones consideradas.',
        blanks: ['desarrollar'], bank: ['desarrollar', 'eliminar', 'ignorar', 'copiar'] },
      { type: 'mc', question: '¿Qué principio indica que el análisis debe enfocarse únicamente en los resultados futuros que diferencian a las alternativas?',
        options: ['Centrarse en las diferencias', 'Usar una unidad de medida común', 'Revisar las decisiones', 'Hacer explícita la incertidumbre'], answer: 0 },
      { type: 'mc', question: 'Principio que exige evaluar desde una sola perspectiva (la empresa, un departamento o un individuo) para evitar favoritismos.',
        options: ['Utilizar un punto de vista consistente', 'Desarrollar las alternativas', 'Tomar en cuenta todos los criterios relevantes', 'Centrarse en las diferencias'], answer: 0 },
      { type: 'mc', question: '¿Qué principio recuerda que un buen proceso de decisión no garantiza el resultado deseado, por lo que debe darse seguimiento posterior?',
        options: ['Revisar las decisiones', 'Hacer explícita la incertidumbre', 'Usar una unidad de medida común', 'Centrarse en las diferencias'], answer: 0 },
      { type: 'fib', text: 'Para facilitar la comparación directa de resultados futuros, se deben cuantificar tantos elementos como sea posible en una {{0}} monetaria común.',
        blanks: ['unidad'], bank: ['unidad', 'cantidad', 'fracción', 'moneda'] },
      { type: 'match', pairs: [
        { left: 'Principio 1', right: 'Desarrollar las Alternativas' },
        { left: 'Principio 4', right: 'Usar una Unidad de Medida Común' },
        { left: 'Principio 6', right: 'Hacer Explícita la Incertidumbre' },
        { left: 'Principio 7', right: 'Revisar las Decisiones' },
      ]},
    ],
  },
  {
    id: 'l4', temaId: 't2', icon: '💵', title: 'El dinero y el interés',
    exercises: [
      { type: 'mc', question: '¿Cómo se le llama al costo que se paga por fondos que se piden prestados?',
        options: ['Interés pagado', 'Interés ganado', 'Valor de salvamento', 'Tasa de inflación'], answer: 0 },
      { type: 'mc', question: 'Un ahorrador invierte dinero y recibe una cantidad mayor. ¿Cómo se denomina esta ganancia?',
        options: ['Interés ganado', 'Interés pagado', 'Capital de riesgo', 'Costo de oportunidad'], answer: 0 },
      { type: 'step',
        statement: 'Un empleado solicita un préstamo de $1,000 el 1 de mayo y debe pagar $1,070 exactamente un año después. Extraiga los datos y calcule el interés pagado.',
        fields: [
          { key: 'P', label: 'Cantidad inicial', symbol: 'P', answer: 1000, tolerance: 1, prefix: '$' },
          { key: 'F', label: 'Cantidad final', symbol: 'F', answer: 1070, tolerance: 1, prefix: '$' },
        ],
        reveal: (v) => ({
          expr: `I = F − P = $${fmt(v.F)} − $${fmt(v.P)}`,
          result: `I = $${fmt(v.F - v.P)}  (i = 7% anual)`,
        }),
      },
      { type: 'step',
        statement: 'Hace un año invirtió cierta cantidad a una tasa de interés del 5% anual y ahora tiene $1,000 en su cuenta. Extraiga los datos conocidos.',
        fields: [
          { key: 'F', label: 'Cantidad final', symbol: 'F', answer: 1000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 5, tolerance: 0.1, suffix: '%' },
        ],
        reveal: (v) => {
          const P = v.F / (1 + v.i / 100);
          return {
            expr: `P = F / (1 + i) = $${fmt(v.F)} / (1 + ${(v.i / 100).toFixed(2)})`,
            result: `P = $${fmt(P)}  →  Interés ganado = $${fmt(v.F - P)}`,
          };
        },
      },
      { type: 'mc', question: '¿Qué esquema de cálculo de interés utiliza principalmente el análisis de IE, por ser el de mayor uso en el mundo real?',
        options: ['Interés compuesto', 'Interés simple', 'Interés fijo anual', 'Interés nominal'], answer: 0 },
    ],
  },
  {
    id: 'l5', temaId: 't2', icon: '📈', title: 'Interés simple vs. compuesto',
    exercises: [
      { type: 'fib', text: 'En el interés simple, el interés se genera solo sobre el {{0}} inicial en cada periodo.',
        blanks: ['capital'], bank: ['capital', 'interés acumulado', 'impuesto', 'saldo final'] },
      { type: 'fib', text: 'En el interés compuesto, el interés de cada periodo se calcula sobre el capital inicial más los intereses {{0}} de periodos anteriores.',
        blanks: ['acumulados'], bank: ['acumulados', 'simples', 'futuros', 'nominales'] },
      { type: 'challenge',
        statement: 'Se otorgó un préstamo de $1,000 por 3 años con un interés SIMPLE del 5% anual. Calcule cuánto debe pagarse al final de los 3 años.',
        fields: [
          { key: 'P', label: 'Capital', symbol: 'P', answer: 1000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 5, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 3, tolerance: 0 },
        ],
        final: { key: 'F', label: 'Monto a pagar', symbol: 'F', answer: 1150, tolerance: 0.5, prefix: '$' },
        steps: [
          'I = P × i × N = $1,000 × 0.05 × 3 = $150',
          'F = P + I = $1,000 + $150 = $1,150',
        ],
      },
      { type: 'challenge',
        statement: 'El mismo préstamo de $1,000 por 3 años, pero ahora con interés COMPUESTO del 5% anual. Calcule el monto a pagar.',
        fields: [
          { key: 'P', label: 'Capital', symbol: 'P', answer: 1000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 5, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 3, tolerance: 0 },
        ],
        final: { key: 'F', label: 'Monto a pagar', symbol: 'F', answer: 1157.63, tolerance: 0.5, prefix: '$' },
        steps: [
          'F = P (1 + i)^N',
          'F = $1,000 × (1.05)³',
          'F = $1,000 × 1.157625',
          'F = $1,157.63',
        ],
      },
      { type: 'mc', question: 'Para un mismo capital, tasa y plazo, ¿cuál esquema genera un monto final mayor?',
        options: ['Interés compuesto', 'Interés simple', 'Son siempre iguales', 'Depende del banco'], answer: 0 },
    ],
  },
  {
    id: 'l6', temaId: 't2', icon: '📊', title: 'Notación y flujo de efectivo',
    exercises: [
      { type: 'match', pairs: [
        { left: 'P', right: 'Valor presente (hoy)' },
        { left: 'F', right: 'Valor futuro' },
        { left: 'A', right: 'Serie uniforme de pagos' },
        { left: 'N', right: 'Número de periodos de capitalización' },
      ]},
      { type: 'mc', question: 'En un diagrama de flujo de efectivo, ¿qué representan las flechas hacia abajo?',
        options: ['Egresos (salidas de efectivo)', 'Ingresos (entradas de efectivo)', 'La tasa de interés', 'El valor futuro'], answer: 0 },
      { type: 'mc', question: '¿Qué representa el punto n = 0 en un diagrama de flujo de efectivo?',
        options: ['El presente', 'El final del proyecto', 'El primer periodo futuro', 'La tasa de interés'], answer: 0 },
      { type: 'fib', text: 'El Flujo de Efectivo Neto se calcula como {{0}} menos egresos.',
        blanks: ['ingresos'], bank: ['ingresos', 'intereses', 'impuestos', 'costos fijos'] },
      { type: 'mc', question: '¿Qué nombre recibe la suposición de que todos los flujos dentro de un periodo ocurren al final del mismo?',
        options: ['Convención de fin de periodo', 'Regla de equivalencia', 'Principio de capitalización', 'Criterio de consistencia'], answer: 0 },
    ],
  },
  {
    id: 'l7', temaId: 't2', icon: '🔁', title: 'Factores de pago único',
    exercises: [
      { type: 'fib', text: "El factor F/P se lee: 'Encontrar {{0}}, dados P, i y N'.",
        blanks: ['F'], bank: ['F', 'P', 'A', 'i'] },
      { type: 'step',
        statement: 'Si tuviera $1,000 ahora y los invirtiera al 7% de interés compuesto anual, ¿cuánto valdrían en 8 años?',
        fields: [
          { key: 'P', label: 'Capital inicial', symbol: 'P', answer: 1000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 7, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de periodos', symbol: 'N', answer: 8, tolerance: 0 },
        ],
        reveal: (v) => {
          const F = v.P * Math.pow(1 + v.i / 100, v.n);
          return { expr: `F = P(1 + i)^N = $${fmt(v.P)} × (1 + ${(v.i / 100).toFixed(2)})^${v.n}`, result: `F = $${fmt(F)}` };
        },
      },
      { type: 'step',
        statement: '¿Cuál debe ser el precio de un bono cupón cero a 8 años con valor nominal de $1,000, si bonos similares rinden 6% de interés anual?',
        fields: [
          { key: 'F', label: 'Valor nominal (futuro)', symbol: 'F', answer: 1000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 6, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de periodos', symbol: 'N', answer: 8, tolerance: 0 },
        ],
        reveal: (v) => {
          const P = v.F / Math.pow(1 + v.i / 100, v.n);
          return { expr: `P = F / (1 + i)^N = $${fmt(v.F)} / (1 + ${(v.i / 100).toFixed(2)})^${v.n}`, result: `P = $${fmt(P)}` };
        },
      },
      { type: 'challenge',
        statement: 'Compró una acción en $10 y la vendió en $20 después de 5 años. Calcule la tasa de interés de retorno (i) de la inversión.',
        fields: [
          { key: 'P', label: 'Valor inicial', symbol: 'P', answer: 10, tolerance: 0.1, prefix: '$' },
          { key: 'F', label: 'Valor final', symbol: 'F', answer: 20, tolerance: 0.1, prefix: '$' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 5, tolerance: 0 },
        ],
        final: { key: 'i', label: 'Tasa de interés de retorno', symbol: 'i', answer: 14.87, tolerance: 0.3, suffix: '%' },
        steps: [
          'F = P(1+i)^N  →  $20 = $10(1+i)⁵',
          '(1+i)⁵ = 2  →  1+i = 2^(1/5)',
          'i = 2^0.2 − 1 = 0.1487',
          'i(%) = 14.87% anual',
        ],
      },
      { type: 'mc', question: 'Calcular el valor presente de una cantidad futura se conoce también como el proceso de...',
        options: ['Descuento', 'Capitalización', 'Amortización', 'Depreciación'], answer: 0 },
    ],
  },
  {
    id: 'l8', temaId: 't2', icon: '🏦', title: 'Factores de serie uniforme',
    exercises: [
      { type: 'fib', text: 'Una serie de pagos iguales que ocurre al final de cada periodo recibe comúnmente el nombre de {{0}}.',
        blanks: ['anualidad'], bank: ['anualidad', 'amortización', 'depreciación', 'capitalización'] },
      { type: 'step',
        statement: 'Usted deposita $5,000 al final de cada año durante 5 años en una cuenta que paga 6% de interés anual. ¿Cuánto podrá retirar al cabo de los 5 años?',
        fields: [
          { key: 'A', label: 'Depósito anual', symbol: 'A', answer: 5000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 6, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 5, tolerance: 0 },
        ],
        reveal: (v) => {
          const ii = v.i / 100;
          const F = v.A * ((Math.pow(1 + ii, v.n) - 1) / ii);
          return { expr: 'F = A[(1+i)^N − 1] / i', result: `F = $${fmt(F)}` };
        },
      },
      { type: 'step',
        statement: 'Reparar una máquina hoy incrementaría la producción generando $20,000 adicionales al final de cada año durante 5 años, con i = 15% anual. ¿Cuánto es razonable invertir en la reparación?',
        fields: [
          { key: 'A', label: 'Flujo anual', symbol: 'A', answer: 20000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 15, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 5, tolerance: 0 },
        ],
        reveal: (v) => {
          const ii = v.i / 100;
          const P = v.A * ((Math.pow(1 + ii, v.n) - 1) / (ii * Math.pow(1 + ii, v.n)));
          return { expr: 'P = A[(1+i)^N − 1] / [i(1+i)^N]', result: `P = $${fmt(P)}` };
        },
      },
      { type: 'challenge',
        statement: 'Quiere tener $100,000 en 8 años para la universidad de su hija, con una tasa del 7% anual. ¿Cuánto debe ahorrar cada año (depósitos a fin de año)?',
        fields: [
          { key: 'F', label: 'Meta futura', symbol: 'F', answer: 100000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 7, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 8, tolerance: 0 },
        ],
        final: { key: 'A', label: 'Ahorro anual', symbol: 'A', answer: 9747, tolerance: 5, prefix: '$' },
        steps: [
          'A = F × i / [(1+i)^N − 1]',
          'A = $100,000 × 0.07 / [(1.07)⁸ − 1]',
          'A = $7,000 / 0.718186',
          'A ≈ $9,747.89',
        ],
      },
      { type: 'challenge',
        statement: 'Solicitó un préstamo de $21,061.82 a 6% anual, a pagar en 5 cuotas anuales iguales. Calcule el valor de cada cuota (A).',
        fields: [
          { key: 'P', label: 'Capital del préstamo', symbol: 'P', answer: 21061.82, tolerance: 5, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 6, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 5, tolerance: 0 },
        ],
        final: { key: 'A', label: 'Cuota anual', symbol: 'A', answer: 5000, tolerance: 2, prefix: '$' },
        steps: [
          'A = P × i(1+i)^N / [(1+i)^N − 1]',
          'A = $21,061.82 × 0.06(1.06)⁵ / [(1.06)⁵ − 1]',
          'A = $21,061.82 × 0.080294 / 0.338226',
          'A = $5,000.00',
        ],
      },
    ],
  },
  {
    id: 'l9', temaId: 't2', icon: '📅', title: 'Tipos de anualidad',
    exercises: [
      { type: 'mc', question: '¿Qué tipo de renta realiza los pagos AL FINAL de cada periodo y es la más común en préstamos?',
        options: ['Vencida (Ordinaria)', 'Anticipada', 'Diferida', 'Perpetua'], answer: 0 },
      { type: 'mc', question: '¿Qué tipo de renta realiza el primer pago en el momento t = 0 (inicio del periodo)?',
        options: ['Anticipada', 'Vencida (Ordinaria)', 'Diferida', 'Inmediata'], answer: 0 },
      { type: 'mc', question: '¿Cómo se denomina el periodo sin pagos de intereses ni de cuota, antes de que comiencen los pagos de una renta diferida?',
        options: ['Periodo de gracia', 'Periodo de capitalización', 'Periodo de amortización', 'Periodo de equivalencia'], answer: 0 },
      { type: 'fib', text: 'Una anualidad anticipada equivale a una anualidad ordinaria multiplicada por {{0}}, ya que cada pago ocurre un periodo antes.',
        blanks: ['(1 + i)'], bank: ['(1 + i)', '(1 − i)', 'i', 'N'] },
      { type: 'challenge',
        statement: 'Un préstamo de $50,000 se pagará en 12 cuotas mensuales iguales al final de cada mes, con tasa del 2% mensual (renta vencida). ¿Cuál es el valor de cada cuota (A)?',
        fields: [
          { key: 'P', label: 'Monto del préstamo', symbol: 'P', answer: 50000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa mensual', symbol: 'i', answer: 2, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de cuotas', symbol: 'N', answer: 12, tolerance: 0 },
        ],
        final: { key: 'A', label: 'Cuota mensual', symbol: 'A', answer: 4728.01, tolerance: 2, prefix: '$' },
        steps: [
          'A = P × i(1+i)^N / [(1+i)^N − 1]',
          'Factor P/A(2%,12) = 10.5753',
          'A = $50,000 / 10.5753 = $4,728.01',
        ],
      },
      { type: 'challenge',
        statement: 'Un local se arrienda en $15,000 mensuales pagaderos al INICIO de cada mes (renta anticipada), por 24 meses, con tasa de 1.5% mensual. Calcule el valor presente de todos los pagos.',
        fields: [
          { key: 'A', label: 'Pago mensual', symbol: 'A', answer: 15000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa mensual', symbol: 'i', answer: 1.5, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de meses', symbol: 'N', answer: 24, tolerance: 0 },
        ],
        final: { key: 'P', label: 'Valor presente', symbol: 'P', answer: 304962.84, tolerance: 50, prefix: '$' },
        steps: [
          'P ordinaria = A(P/A,1.5%,24) = $15,000 × 20.0304 = $300,456',
          'P anticipada = P ordinaria × (1 + i)',
          'P anticipada = $300,456 × 1.015 = $304,962.84',
        ],
      },
      { type: 'challenge',
        statement: 'Un proyecto generará ingresos netos de $80,000 anuales durante 5 años, comenzando a partir del año 4 (3 años de espera). Con tasa de descuento del 12% anual, ¿cuál es el valor presente de esos ingresos llevado al año 0?',
        fields: [
          { key: 'A', label: 'Ingreso anual', symbol: 'A', answer: 80000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de interés', symbol: 'i', answer: 12, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de pagos', symbol: 'N', answer: 5, tolerance: 0 },
          { key: 'k', label: 'Años de espera (gracia)', symbol: 'k', answer: 3, tolerance: 0 },
        ],
        final: { key: 'P0', label: 'Valor presente en año 0', symbol: 'P₀', answer: 205271.73, tolerance: 100, prefix: '$' },
        steps: [
          'P₃ = A(P/A,12%,5) = $80,000 × 3.6048 = $288,384',
          'P₀ = P₃ × (1 + i)⁻ᵏ = $288,384 × (1.12)⁻³',
          'P₀ = $288,384 × 0.7118 = $205,271.73',
        ],
      },
    ],
  },
  {
    id: 'l10', temaId: 't2', icon: '🏆', title: 'Desafío final: VPN y TIR',
    exercises: [
      { type: 'mc', question: 'Es la diferencia entre el valor presente de los ingresos futuros y la inversión inicial de un proyecto.',
        options: ['Valor Presente Neto (VPN)', 'Tasa Interna de Retorno (TIR)', 'Punto de Equilibrio', 'Valor de Salvamento'], answer: 0 },
      { type: 'mc', question: 'Es la tasa de interés en la cual el VPN se hace exactamente igual a cero.',
        options: ['Tasa Nominal', 'TIR', 'TEA', 'VF'], answer: 1 },
      { type: 'fib', text: 'Si el VPN de un proyecto es {{0}}, el proyecto se considera económicamente aceptable a esa tasa de descuento.',
        blanks: ['positivo'], bank: ['positivo', 'negativo', 'igual a la inversión', 'indefinido'] },
      { type: 'challenge',
        statement: 'Una máquina cuesta $5,000 hoy y generará flujos de $2,000 al final de cada uno de los próximos 3 años. Si la tasa de descuento es 10% anual, calcule el VPN del proyecto.',
        fields: [
          { key: 'I0', label: 'Inversión inicial', symbol: 'I₀', answer: 5000, tolerance: 1, prefix: '$' },
          { key: 'A', label: 'Flujo anual', symbol: 'A', answer: 2000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de descuento', symbol: 'i', answer: 10, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 3, tolerance: 0 },
        ],
        final: { key: 'VPN', label: 'VPN', symbol: 'VPN', answer: -26.3, tolerance: 0.5, prefix: '$' },
        steps: [
          'VPN = −I₀ + Σ [A / (1+i)ᵗ]',
          'VPN = −$5,000 + $2,000/1.1 + $2,000/1.1² + $2,000/1.1³',
          'VPN = −$5,000 + $1,818.18 + $1,652.89 + $1,502.63',
          'VPN = −$26.30  →  el proyecto NO alcanza el rendimiento mínimo exigido',
        ],
      },
      { type: 'challenge',
        statement: 'Un proyecto requiere una inversión inicial de $10,000 y generará ingresos de $4,000 al final de cada año durante 4 años. Con i = 8% anual, calcule el VPN.',
        fields: [
          { key: 'I0', label: 'Inversión inicial', symbol: 'I₀', answer: 10000, tolerance: 1, prefix: '$' },
          { key: 'A', label: 'Flujo anual', symbol: 'A', answer: 4000, tolerance: 1, prefix: '$' },
          { key: 'i', label: 'Tasa de descuento', symbol: 'i', answer: 8, tolerance: 0.1, suffix: '%' },
          { key: 'n', label: 'Número de años', symbol: 'N', answer: 4, tolerance: 0 },
        ],
        final: { key: 'VPN', label: 'VPN', symbol: 'VPN', answer: 3248.51, tolerance: 1, prefix: '$' },
        steps: [
          'VPN = −I₀ + A[(1+i)^N − 1] / [i(1+i)^N]',
          'VPN = −$10,000 + $4,000 × 3.3121',
          'VPN = −$10,000 + $13,248.51',
          'VPN = $3,248.51  →  proyecto aceptable (VPN > 0)',
        ],
      },
      { type: 'mc', question: 'Un proyecto tiene una inversión de $10,000 y genera pagos anuales iguales de $2,637.97 durante 5 años. ¿Cuál es la TIR aproximada del proyecto?',
        options: ['8%', '10%', '12%', '15%'], answer: 1 },
      { type: 'mc', question: 'Si la TIR de un proyecto es MAYOR que la TMAR exigida por la empresa, el proyecto debería...',
        options: ['Aceptarse', 'Rechazarse', 'Posponerse indefinidamente', 'Ser ignorado'], answer: 0 },
    ],
  },
];
