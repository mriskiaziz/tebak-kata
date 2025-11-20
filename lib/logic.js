export default function cekKata(jawaban, tebakan) {
  const result = [];
  const jawabanArr = jawaban.split('');
  const tebakanArr = tebakan.split('');

  // Tandai huruf yang sudah dipakai
  const used = Array(jawaban.length).fill(false);

  // Cek posisi benar (hijau)
  for (let i = 0; i < tebakanArr.length; i++) {
    if (tebakanArr[i] === jawabanArr[i]) {
      result[i] = "green"; // posisi benar
      used[i] = true;
    }
  }

  // Cek posisi salah tapi huruf ada (kuning)
  for (let i = 0; i < tebakanArr.length; i++) {
    if (!result[i]) {
      const index = jawabanArr.findIndex(
        (c, idx) => c === tebakanArr[i] && !used[idx]
      );

      if (index !== -1) {
        result[i] = "yellow"; // huruf ada tapi salah posisi
        used[index] = true;
      } else {
        result[i] = "gray"; // tidak ada sama sekali
      }
    }
  }

  return result;
}