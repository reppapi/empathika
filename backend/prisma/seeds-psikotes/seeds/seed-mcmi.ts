/**
 * Seeder master data alat ukur dan paket tes MCMI-IV (Millon Clinical Multiaxial Inventory-IV).
 * 195 Butir Soal True-False (+/-) dan 390 Pilihan Jawaban.
 */
import { PrismaClient, JenisAksesPsikotes } from '@prisma/client'

export const MCMI_OPSI = [
  { label: '+', text: 'Sesuai', bobot: 1 },
  { label: '-', text: 'Tidak Sesuai', bobot: 0 },
]

export const MCMI_SOAL: Array<{ no: number; text: string }> = [
  { no: 1, text: 'Akhir-akhir ini, kekuatan fisikku semakin merosot.' },
  { no: 2, text: 'Aku selalu berusaha agar pekerjaanku terencana dan terorganisir dengan baik' },
  { no: 3, text: 'Aku ingin melakukan banyak kegiatan, tetapi aku tidak mampu memutuskan kegiatan mana yang perlu didahulukan.' },
  { no: 4, text: 'Masalahku adalah aku akan ditinggal oleh orang yang aku andalkan' },
  { no: 5, text: 'Meskipun aku takut untuk berteman tetapi aku berharap aku dapat memiliki beberapa teman.' },
  { no: 6, text: 'Aku jarang memperlihatkan perasaanku kepada orang lain.' },
  { no: 7, text: 'Ketika berjalan, aku sulit mempertahankan keseimbangan tubuhku.' },
  { no: 8, text: 'Aku selalu mencari kegiatan yang baru dan menyenangkan.' },
  { no: 9, text: 'Kadang-kadang aku bisa menjadi agak kasar dan kejam pada keluargaku.' },
  { no: 10, text: 'Aku senang menjadi pusat perhatian banyak orang.' },
  { no: 11, text: 'Pada masa remaja, aku mengalami banyak kesulitan karena kelakuanku yang buruk di sekolah.' },
  { no: 12, text: 'Aku takut terlalu dekat dengan orang lain karena nanti aku akan diejek atau dipermalukan.' },
  { no: 13, text: 'Ketika aku berpapasan dengan sekelompok orang, aku tahu mereka sedang membicarakan diriku.' },
  { no: 14, text: 'Sejak beberapa tahun yang lalu, aku mulai merasa gagal.' },
  { no: 15, text: 'Bila disuruh memilih, aku lebih memilih bekerja sendiri saja.' },
  { no: 16, text: 'Akhir-akhir ini, aku merasa ingin membanting barang.' },
  { no: 17, text: 'Kelancaran yang berlangsung hari ini akan cepat berlalu.' },
  { no: 18, text: 'Kadang-kadang aku bisa seperti orang gila bila kehidupanku mulai memburuk.' },
  { no: 19, text: 'Aku melakukan apapun yang aku inginkan, tanpa peduli akibatnya pada orang lain.' },
  { no: 20, text: 'Aku menjalani aktivitas sehari-hariku dengan penuh energik terus menerus.' },
  { no: 21, text: 'Aku tidak akan memaafkan orang yang menghina atau mempermalukan aku.' },
  { no: 22, text: 'Sekarang, aku sering merasa sangat sedih.' },
  { no: 23, text: 'Aku cenderung menyalahkan diri sendiri atas kesalahan yang terjadi.' },
  { no: 24, text: 'Sejak beberapa tahun yang lalu, aku mulai merasa gagal.' },
  { no: 25, text: 'Aku peminum minuman keras (alkohol), yang membawa masalah untuk aku dan keluargaku.' },
  { no: 26, text: 'Aku sangat pemalu.' },
  { no: 27, text: 'Beberapa kali aku merasa sangat gembira tanpa alasan.' },
  { no: 28, text: 'Dalam beberapa pekan terakhir aku merasa sangat lelah tanpa sebab.' },
  { no: 29, text: 'Aku lebih menghargai waktu daripada orang lain.' },
  { no: 30, text: 'Aku selalu mencari teman baru dan menemui orang yang belum aku kenal.' },
  { no: 31, text: 'Beberapa minggu terakhir, aku sangat gelisah.' },
  { no: 32, text: 'Aku belum juga memperoleh keberuntungan seperti yang didapat orang lain.' },
  { no: 33, text: 'Banyak ide yang muncul dipikiranku dan tidak mau hilang-hilang.' },
  { no: 34, text: 'Dalam satu tahun terakhir, aku memandang kehidupan ini dengan pesimistik dan sedih.' },
  { no: 35, text: 'Aku berusaha melakukan segala sesuatu sesempurna mungkin.' },
  { no: 36, text: 'Kebiasaanku memakai narkoba telah menyebabkan aku kehilangan pekerjaan.' },
  { no: 37, text: 'Dari hari ke hari, suasana perasaanku berubah-ubah cukup menyolok' },
  { no: 38, text: 'Aku menggunakan daya tarikku untuk mendapatkan apa yang kuinginkan.' },
  { no: 39, text: 'Aku sering berpikir kalau aku tidak layak menerima keberuntungan yang aku alami.' },
  { no: 40, text: 'Dimasa lampau aku pernah melukai diriku sendiri dengan sengaja.' },
  { no: 41, text: 'Aku tidak bisa tidur dan ketika bangun tidur aku merasa lelah.' },
  { no: 42, text: 'Aku sering membiarkan orang lain mengambil keputusan penting untuk diriku.' },
  { no: 43, text: 'Tidak banyak kejadian yang dapat membuat aku sedih atau gembira.' },
  { no: 44, text: 'Aku terus menerus memiliki pemikiran yang aneh dan aku tidak menginginkan seperti itu.' },
  { no: 45, text: 'Aku mengalami kesulitan untuk menahan diriku agar tidak minum alkohol berlebihan.' },
  { no: 46, text: 'Sangat mudah bagi aku untuk memiliki banyak teman.' },
  { no: 47, text: 'Aku malu pada beberapa tindakan pelecehan yang aku alami ketika aku masih remaja.' },
  { no: 48, text: 'Aku sangat taat peraturan, sebab peraturan itu merupakan pedoman yang bagus.' },
  { no: 49, text: 'Tahun lalu, fotoku menghiasi halaman depan beberapa majalah.' },
  { no: 50, text: 'Aku seringkali marah pada orang yang bekerja lambat.' },
  { no: 51, text: 'Aku selalu khawatir dari masalah yang satu ke masalah yang lain.' },
  { no: 52, text: 'Jika seseorang berbuat sangat baik padaku, aku selalu ingin tahu alasannya.' },
  { no: 53, text: 'Aktivitasku sehari-hari mengasyikan dan membangkitkan semangat.' },
  { no: 54, text: 'Aku memiliki banyak ide yang canggih (orientasi jauh ke masa depan).' },
  { no: 55, text: 'Aku tidak mampu berkonsentrasi lagi sejak aku mengalami gegar otak yang berat.' },
  { no: 56, text: 'Orang-orang mengatakan bahwa dahulu aku sangat bersemangat terhadap banyak hal sekaligus.' },
  { no: 57, text: 'Aku sangat kehilangan nafsu makan dan sulit tidur hampir setiap malam.' },
  { no: 58, text: 'Waktu masih kecil, aku pernah tidak menyadari apa yang terjadi di sekitarku.' },
  { no: 59, text: 'Aku tidak mengalami banyak kesenangan dalam hidup karena aku merasakan aku tidak pantas mendapatkannya.' },
  { no: 60, text: 'Aku lebih senang disuruh apa yang harus aku lakukan (daripada memutuskan sendiri).' },
  { no: 61, text: 'Masalahku memakai narkoba telah menyebabkan percekcokan dalam keluargaku.' },
  { no: 62, text: 'Teringat akan pengalaman yang sangat mengecewakan sering menghantui pikiranku.' },
  { no: 63, text: 'Menurut kesan orang banyak, aku sangat berhati-hati.' },
  { no: 64, text: 'Aku sering tidak dapat merasakan kesenangan yang sebelumnya aku rasakan (termasuk seks).' },
  { no: 65, text: 'Beberapa kali aku mendapat masalah dengan hukum.' },
  { no: 66, text: 'Aku terpaksa harus bersikap kasar pada beberapa orang agar mereka mentaati peraturan.' },
  { no: 67, text: 'Aku sangat percaya diri.' },
  { no: 68, text: 'Banyak orang berusaha meyakinkan aku bahwa aku gila.' },
  { no: 69, text: 'Beberapa kali dalam seminggu aku pergi makan-makan yang berlebihan.' },
  { no: 70, text: 'Aku sering merasa tidak ada apa-apa lagi dalam diriku, seperti rasa kosong dan tak berdaya.' },
  { no: 71, text: 'Aku selalu sulit menghentikan perasaan sedih dan perasaan tidak bahagia.' },
  { no: 72, text: 'Ketika aku sendirian dan jauh dari rumah, aku seringkali merasa tegang dan panik.' },
  { no: 73, text: 'Banyak orang mengatakan bahwa aku adalah orang yang sangat sopan dan bermoral tinggi.' },
  { no: 74, text: 'Aku sulit mengendalikan amarahku.' },
  { no: 75, text: 'Aku sangat optimistik.' },
  { no: 76, text: 'Terhadap bencana yang telah mengancam hidupku, beberapa tahun kemudian aku tetap mengalami mimpi buruk tentang peristiwa itu.' },
  { no: 77, text: 'Agar bisa mengerjakan sesuatu dengan baik, aku membutuhkan banyak nasihat.' },
  { no: 78, text: 'Akhir-akhir ini, aku telah berpikir sungguh-sungguh untuk bunuh diri.' },
  { no: 79, text: 'Orang licik sering mencoba untuk mendapatkan keuntungan dari apa yang aku lakukan atau apa yang aku pikirkan.' },
  { no: 80, text: 'Akhir-akhir ini, aku merasa telah hancur.' },
  { no: 81, text: 'Penggunaan narkoba itu mungkin tidak bijaksana, tetapi dahulu aku membutuhkannya.' },
  { no: 82, text: 'Pendirianku tak menentu, aku selalu berubah-ubah pikiran maupun perasaan.' },
  { no: 83, text: 'Bila aku mengalami kesulitan, aku sangat pandai membuat alasan pembelaannya.' },
  { no: 84, text: 'Di sebuah pesta, aku selalu duduk di deretan bangku yang utama.' },
  { no: 85, text: 'Aku cenderung mengabaikan datangnya kesempatan yang bagus.' },
  { no: 86, text: 'Kadang-kadang sesudah makan, aku memaksakan diri untuk muntah.' },
  { no: 87, text: 'Aku orang spesial, karena itu aku tidak peduli apa pendapat orang lain tentang diriku.' },
  { no: 88, text: 'Aku sangat teliti mengamati keluargaku, sehingga aku tahu siapa yang dapat dipercaya.' },
  { no: 89, text: 'Ada beberapa hal tertentu yang terus menerus timbul dalam pikiranku.' },
  { no: 90, text: 'Hanya sedikit hal/keadaan yang dapat membuat aku senang.' },
  { no: 91, text: 'Aku merasa gemetar dan sulit tertidur karena teringat terus pengalaman yang menyakitkan di masa lampau.' },
  { no: 92, text: 'Pikiranku sering kosong dan lupa apa yang terjadi di sekitarku.' },
  { no: 93, text: 'Aku berperasaan kuat bahwa aku tidak berguna bagi orang lain.' },
  { no: 94, text: 'Aku memiliki masalah minum alkohol yang aku tidak mampu mengakhirinya.' },
  { no: 95, text: 'Seseorang berusaha mengendalikan pikiranku.' },
  { no: 96, text: 'Kebanyakan orang bisa sukses hanya dikarenakan keberuntungan atau tidak jujur.' },
  { no: 97, text: 'Aku sering membuat orang lain marah karena terlalu mengatur mereka.' },
  { no: 98, text: 'Sepuluh tahun belakangan ini, aku tidak pernah melihat mobil.' },
  { no: 99, text: 'Di depan banyak orang, aku hampir selalu merasa grogi dan tegang.' },
  { no: 100, text: 'Aku cenderung menciptakan situasi yang menyakiti diriku atau merasa ditolak.' },
  { no: 101, text: 'Aku merasa sangat sedih tanpa alasan yang jelas.' },
  { no: 102, text: 'Aku dikatakan berbadan kurus, tetapi aku merasa pahaku dan punggungku terlalu besar.' },
  { no: 103, text: 'Aku sering senang memulai perdebatan atau perkelahian.' },
  { no: 104, text: 'Aku menjaga rahasia pribadiku secara rapih agar tidak ada orang yang dapat mengambil keuntungan dariku.' },
  { no: 105, text: 'Di masa lampau, kebiasaan menggunakan narkoba telah mengakibatkan aku mengalami banyak masalah.' },
  { no: 106, text: 'Aku sering disalahkan atas masalah yang bukan tanggung jawabku.' },
  { no: 107, text: 'Menatap hari esok akan membuat aku sangat sedih.' },
  { no: 108, text: 'Kadang orang-orang merasa terganggu olehku karena aku berbicara terlalu banyak dan terlalu cepat.' },
  { no: 109, text: 'Aku tidak akan mampu mengatasi permasalahan oleh diriku sendiri.' },
  { no: 110, text: 'Sejak beberapa tahun ini, otakku tidak mampu berfungsi secara baik.' },
  { no: 111, text: 'Aku selalu merasa kesepian dan kosong.' },
  { no: 112, text: 'Dibelakangku, orang-orang suka mentertawakan aku.' },
  { no: 113, text: 'Akhir-akhir ini, aku sering merasa sangat tegang dan keringatan.' },
  { no: 114, text: 'Sejak beberapa minggu terakhir, perasaanku makin bertambah sedih.' },
  { no: 115, text: 'Amarahku sangat cepat meledak pada orang yang mengganggu aku.' },
  { no: 116, text: 'Beberapa kali aku tidak sanggup menahan diri untuk memakai narkoba.' },
  { no: 117, text: 'Aku sangat senang bergaul akrab.' },
  { no: 118, text: 'Aku tak berdaya untuk melakukan kewajibanku sehari-hari.' },
  { no: 119, text: 'Emosiku cenderung lemah.' },
  { no: 120, text: 'Aku sering merasa lemah dan lelah.' },
  { no: 121, text: 'Ide-ide aneh masuk ke dalam pikiranku dan tidak mau hilang.' },
  { no: 122, text: 'Orang lain diberi kesempatan, tetapi aku tidak.' },
  { no: 123, text: 'Aku mengulang-ulang perilaku tertentu terus menerus untuk mengurangi rasa gelisah dan untuk mencegah terjadinya musibah.' },
  { no: 124, text: 'Aku telah minum obat yang semestinya bukan untuk pengobatan diriku' },
  { no: 125, text: 'Sekarang aku masih bingung dengan teringat pengalamanku yang seram.' },
  { no: 126, text: 'Aku sering merusak hal-hal baik yang aku alami.' },
  { no: 127, text: 'Suara-suara setan sedang mencoba mengendalikan pikiranku.' },
  { no: 128, text: 'Aku akan merasa sangat bersalah setelah marah-marah.' },
  { no: 129, text: 'Semangatku untuk bekerja tidak pernah berkurang.' },
  { no: 130, text: 'Aku kira aku tidak ada bedanya dengan orang tuaku mengenai kecenderungan ketagihan alkohol' },
  { no: 131, text: 'Akhir-akhir ini, aku telah berpikir berulang-ulang tanpa sebab.' },
  { no: 132, text: 'Aku menginginkan orang lain mengagumi hasil kerjaku.' },
  { no: 133, text: 'Aku akan menyerah dalam melakukan sesuatu bila aku harus melakukannya sendirian.' },
  { no: 134, text: 'Aku telah mencoba bunuh diri.' },
  { no: 135, text: 'Aku seorang yang penakut dan pemalu.' },
  { no: 136, text: 'Ada beberapa orang, semestinya mereka temanku, tetapi malah ingin mencelakai aku.' },
  { no: 137, text: 'Aku sering kelepasan marah-marah dan kemudian sangat menyesalinya.' },
  { no: 138, text: 'Aku sering mendengar suara-suara yang cukup mengganggu aku.' },
  { no: 139, text: 'Selain keluarga, aku tidak memiliki teman dekat.' },
  { no: 140, text: 'Keadaan yang kacau balau akan membuat aku merasa sangat tidak nyaman.' },
  { no: 141, text: 'Aku sering mengkritik orang lain jika mereka menjengkelkan aku.' },
  { no: 142, text: 'Aku memiliki banyak bakat yang diinginkan orang lain.' },
  { no: 143, text: 'Ada peristiwa mengerikan yang terjadi di masa lampau yang sering muncul dan menghantui pikiranku dan mimpiku.' },
  { no: 144, text: 'Aku tahu aku telah menghabiskan banyak uang untuk membeli narkoba.' },
  { no: 145, text: 'Tanpa disadari, aku sering memarahi (sambil teriak-teriak) pada teman-teman dan keluarga.' },
  { no: 146, text: 'Aku terganggu oleh badanku yang sangat mudah lelah.' },
  { no: 147, text: 'Tidak masalah melawan aturan bila kamu tidak ingin tertangkap.' },
  { no: 148, text: 'Aku yakin ada komplotan yang bersekongkol memusuhi aku.' },
  { no: 149, text: 'Aku suka menyendiri dan aku tidak mempermasalahkannya.' },
  { no: 150, text: 'Aku masih ketakutan saat terpikirkan pengalaman traumatis yang terjadi beberapa tahun lalu.' },
  { no: 151, text: 'Kadang-kadang aku merasa sangat bersalah karena aku tidak mampu bekerja dengan baik lagi.' },
  { no: 152, text: 'Hukuman tidak dapat menghentikan aku untuk melakukan apa yang aku inginkan.' },
  { no: 153, text: 'Aku jarang mempercayai apa yang diberitahukan orang lain kepadaku.' },
  { no: 154, text: 'Aku termasuk orang yang sangat mudah bergaul.' },
  { no: 155, text: 'Aku antusias hampir pada semua kegiatan yang aku lakukan.' },
  { no: 156, text: 'Aku bingung tentang siapa diriku.' },
  { no: 157, text: 'Aku benci teringat berbagai cara aku disiksa pada masa kanak-kanak.' },
  { no: 158, text: 'Aku tidak akan melawan peraturan, walaupun aku bisa melakukannya.' },
  { no: 159, text: 'Ada beberapa anggota keluargaku mengatakan aku egois dan hanya mementingkan diri sendiri.' },
  { no: 160, text: 'Tahun yang lalu aku bepergian ke Eropa sebanyak 30 kali.' },
  { no: 161, text: 'Minum alkohol akan membantu bila aku merasa sangat sedih.' },
  { no: 162, text: 'Aku lebih senang sebagai pengikut daripada sebagai pemimpin.' },
  { no: 163, text: 'Sering banyak ide muncul dalam pikiranku jauh melampaui kecepatanku untuk mengatakannya.' },
  { no: 164, text: 'Aku sering sangat sedih dan ingin sungguh-sungguh melukai diriku.' },
  { no: 165, text: 'Sebagian orang mengatakan bahwa aku orang aneh.' },
  { no: 166, text: 'Kadang-kadang aku merasa nyaman dalam kesengsaraanku.' },
  { no: 167, text: 'Sering terjadi aku diperlakukan secara tidak adil.' },
  { no: 168, text: 'Aku cepat marah pada orang yang tidak menyetujui pendapatku.' },
  { no: 169, text: 'Aku sering merasa bersalah yang aku tidak tahu sebabnya.' },
  { no: 170, text: 'Aku merasa sedih dan galau serta tidak mampu mengubahnya.' },
  { no: 171, text: 'Aku tahu cara merayu orang.' },
  { no: 172, text: 'Aku selalu mengamati kalau ada orang yang akan menjahati aku.' },
  { no: 173, text: 'Aku selalu menyetujui apa yang orang lain ingin lakukan.' },
  { no: 174, text: 'Aku menghadapi semua tantangan hidup dengan tegas dan penuh semangat.' },
  { no: 175, text: 'Aku merasa tidak ada manfaatnya terlibat dalam percakapan dengan orang-orang.' },
  { no: 176, text: 'Jika ada obat yang tidak terasa efeknya, aku akan minum lebih banyak atau meningkatkan dosisnya.' },
  { no: 177, text: 'Seringkali dalam kehidupanku, aku merasa sangat gembira dan terlalu semangat.' },
  { no: 178, text: 'Aku sering merasa tidak nyaman dengan keadaan diri.' },
  { no: 179, text: 'Aku tidak ingin merubah rutinitasku.' },
  { no: 180, text: 'Aku tidak membutuhkan teman dekat.' },
  { no: 181, text: 'Kadang-kadang dengan melukai diriku mendatangkan efek yang nyaman bagiku.' },
  { no: 182, text: 'Sejak bertahun-tahun, banyak orang telah memata-matai kehidupan pribadiku.' },
  { no: 183, text: 'Aku mampu menipu orang lain bila aku mau.' },
  { no: 184, text: 'Walaupun sedang tidak ada masalah, aku selalu khawatir akan terjadi musibah.' },
  { no: 185, text: 'Aku sangat mampu memberi inspirasi dan menyemangati orang lain.' },
  { no: 186, text: 'Aku ingin berpuasa agar lebih kurus dari keadaan sekarang ini.' },
  { no: 187, text: 'Aku sering mudah tersinggung dan mudah marah.' },
  { no: 188, text: 'Aku selalu menyelesaikan dahulu pekerjaanku sebelum bersenang-senang.' },
  { no: 189, text: 'Orang lain kurang memahami kelebihan kemampuanku.' },
  { no: 190, text: 'Aku tidak mampu memahami perasaan orang lain.' },
  { no: 191, text: 'Terlalu banyak peraturan yang menghalangi apa yang ingin aku lakukan.' },
  { no: 192, text: 'Kadang-kadang aku merasa pantas mendapat ketidakbahagiaan.' },
  { no: 193, text: 'Aku sering merasa sedih dan putus asa sepanjang hidupku.' },
  { no: 194, text: 'Aku cenderung mengikuti pendapat orang lain.' },
  { no: 195, text: 'Aku menghindari hampir semua kegiatan sosial, karena aku menduga orang-orang akan menolak aku.' },
]

export async function seedMCMI(prisma: PrismaClient) {
  console.log('\n--- Menyemai Master Data Alat Ukur MCMI-IV ---')

  // 1. Master Data AlatUkur
  const alatUkur = await prisma.alatUkur.upsert({
    where: { kode: 'MCMI-IV' },
    update: {
      nama: 'Millon Clinical Multiaxial Inventory-IV (MCMI-IV)',
      kategori: 'Kepribadian Klinis & Sindroma Multiaxial',
    },
    create: {
      kode: 'MCMI-IV',
      nama: 'Millon Clinical Multiaxial Inventory-IV (MCMI-IV)',
      kategori: 'Kepribadian Klinis & Sindroma Multiaxial',
    },
  })
  console.log(`    ✓ AlatUkur: ${alatUkur.nama} (${alatUkur.kode})`)

  // 2. Produk Paket MCMI-IV (Berbayar)
  const judulPaket = 'Tes Kepribadian dan Pola Klinis'
  let paket = await prisma.paketPsikotes.findFirst({
    where: {
      OR: [
        { judul: judulPaket },
        { judul: { contains: 'MCMI', mode: 'insensitive' } },
        { id_alat_ukur: alatUkur.id },
      ],
    },
  })

  const paketPayload = {
    judul: judulPaket,
    id_alat_ukur: alatUkur.id,
    jenis_akses: JenisAksesPsikotes.BERBAYAR,
    harga: 75000,
    banner_url: '/images/psikotes/banner-default.jpg',
    tentang_tes:
      'Pernah bertanya-tanya mengapa kamu memiliki cara tertentu dalam berpikir, merasakan sesuatu, atau menjalin hubungan dengan orang lain? Tes ini mengajak kamu mengenali pola kepribadian dan karakteristik psikologis dirimu, mulai dari cara membangun relasi, mengelola emosi, dan memandang diri sendiri, hingga berbagai kecenderungan pola klinis yang mungkin berkaitan dengan kondisi psikologismu.',
    status: 'PUBLISHED',
    perlu_review_psikolog: true,
  }

  if (paket) {
    paket = await prisma.paketPsikotes.update({
      where: { id: paket.id },
      data: paketPayload,
    })
  } else {
    paket = await prisma.paketPsikotes.create({
      data: paketPayload,
    })
  }
  console.log(`    ✓ Paket: ${paket.judul} (Berbayar - Rp ${Number(paket.harga).toLocaleString('id-ID')})`)

  // 3. 195 Butir Soal & 390 Pilihan Jawaban (+/-)
  const existingSoal = await prisma.soalPsikotes.findMany({
    where: { id_paket: paket.id },
    include: { pilihan_jawaban: true },
  })
  const soalByUrutan = new Map(existingSoal.map((s) => [s.urutan, s]))

  for (const q of MCMI_SOAL) {
    const existing = soalByUrutan.get(q.no)

    if (!existing) {
      await prisma.soalPsikotes.create({
        data: {
          id_paket: paket.id,
          urutan: q.no,
          pertanyaan: q.text,
          pilihan_jawaban: {
            create: MCMI_OPSI.map((opt) => ({
              label: opt.label,
              teks_jawaban: opt.text,
              bobot: opt.bobot,
            })),
          },
        },
      })
      continue
    }

    if (existing.pertanyaan !== q.text) {
      await prisma.soalPsikotes.update({
        where: { id: existing.id },
        data: { pertanyaan: q.text },
      })
    }

    const pilihanByLabel = new Map(existing.pilihan_jawaban.map((p) => [p.label, p]))
    for (const opt of MCMI_OPSI) {
      const existingPil = pilihanByLabel.get(opt.label)
      if (!existingPil) {
        await prisma.pilihanJawaban.create({
          data: {
            id_soal: existing.id,
            label: opt.label,
            teks_jawaban: opt.text,
            bobot: opt.bobot,
          },
        })
      } else if (existingPil.teks_jawaban !== opt.text || existingPil.bobot !== opt.bobot) {
        await prisma.pilihanJawaban.update({
          where: { id: existingPil.id },
          data: {
            teks_jawaban: opt.text,
            bobot: opt.bobot,
          },
        })
      }
    }
  }
  console.log('    ✓ 195 Butir Soal & 390 Pilihan Jawaban (+/-) MCMI-IV berhasil disemai')

  // 4. Kategori Interpretasi Baseline
  const existingInter = await prisma.interpretasiPsikotes.findFirst({
    where: { id_paket: paket.id },
  })
  if (!existingInter) {
    await prisma.interpretasiPsikotes.create({
      data: {
        id_paket: paket.id,
        min_skor: 0,
        max_skor: 1000,
        grade: 'Profil Multiaxial MCMI-IV',
        judul: 'Laporan Kepribadian dan Pola Klinis (MCMI-IV)',
        deskripsi:
          'Hasil asesmen diolah menggunakan profil Base Rate (BR) 15 spektrum kepribadian, 10 sindroma klinis, serta indeks validitas (V, W, X, Y, Z) sesuai panduan diagnostik DSM-5.',
      },
    })
  } else if (existingInter.judul !== 'Laporan Kepribadian dan Pola Klinis (MCMI-IV)') {
    await prisma.interpretasiPsikotes.update({
      where: { id: existingInter.id },
      data: {
        judul: 'Laporan Kepribadian dan Pola Klinis (MCMI-IV)',
      },
    })
  }

  return paket
}

if (process.argv[1]?.includes('seed-mcmi')) {
  const p = new PrismaClient()
  seedMCMI(p)
    .then(async () => {
      await p.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Error saat menjalankan seed-mcmi:', e)
      await p.$disconnect()
      process.exit(1)
    })
}

