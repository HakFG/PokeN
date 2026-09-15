// lib/trainer-card/generate-id.ts

/** Gera um Trainer ID de 5 dígitos, com zero à esquerda. */
export function generateTrainerId(): string {
  const num = Math.floor(Math.random() * 100000);
  return num.toString().padStart(5, '0');
}
