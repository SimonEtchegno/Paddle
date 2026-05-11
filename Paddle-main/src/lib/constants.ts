export const HORAS = ['14:30', '16:00', '17:30', '19:00', '20:30', '22:00', '23:30'];

export const TURNOS_FIJOS: Record<number, Record<string, Record<number, string>>> = {
  1: { // Lunes
    '17:30': { 1: 'KANU', 2: 'OCTA' },
    '19:00': { 1: 'PITU', 2: 'PATO' },
    '20:30': { 1: 'JORGE', 2: 'GUSTAVO' }
  },
  2: { // Martes
    '19:00': { 1: 'PANCHITO', 2: 'JUAN G' },
    '20:30': { 1: 'LICHO', 2: '4TA' }
  },
  3: { // Miércoles
    '19:00': { 1: 'ARTURO', 2: 'GONZA C' },
    '20:30': { 1: 'Mati C', 2: 'FER ruso' }
  },
  4: { // Jueves
    '19:00': { 1: 'JOAQUÍN H', 2: 'LEO C' },
    '20:30': { 1: 'EDU LIMA', 2: 'PIKAR' }
  }
};

export const CATEGORIAS = ['2da', '3ra', '4ta', '5ta', '6ta', '7ma', 'Principiante'];
