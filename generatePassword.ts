function generatePassword(charset: string[], random: number[]):string {
  const result: string[] = [];
  for (let i = 0; i < random.length; i++) {
    result[i] = charset[random[i]];
  }
  return result.join('');
}