require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Sector = require("../models/Sector");

const data = [
  { id:1, name:{ en:"Executive Leadership", am:"ሥራ አስፈጻሚ አመራር" }, description:{ en:"Sector overseeing executive leadership and strategic direction of the Ministry.", am:"የሚኒስቴሩን ሥራ አስፈጻሚ አመራር እና ስትራቴጂካዊ አቅጣጫ የሚያስተዳድር ዘርፍ።" } },
  { id:2, name:{ en:"Innovation & Technology", am:"ፈጠራ እና ቴክኖሎጂ" }, description:{ en:"Sector promoting technology development, innovation and digital economy.", am:"የቴክኖሎጂ ልማት፣ ፈጠራ እና ዲጂታል ኢኮኖሚን የሚያበረታታ ዘርፍ።" } },
  { id:3, name:{ en:"Finance & Administration", am:"ፋይናንስ እና አስተዳደር" }, description:{ en:"Sector managing the Ministry's financial administration, procurement and audit.", am:"የሚኒስቴሩን የፋይናንስ አስተዳደር፣ ግዥ እና ኦዲት የሚያስተዳድር ዘርፍ።" } },
  { id:4, name:{ en:"Policy & Strategy", am:"ፖሊሲ እና ስትራቴጂ" }, description:{ en:"Sector formulating national technology policies and strategic plans.", am:"ብሔራዊ የቴክኖሎጂ ፖሊሲዎችን እና ስትራቴጂካዊ ዕቅዶችን የሚቀርጽ ዘርፍ።" } },
  { id:5, name:{ en:"HR & Competency", am:"ሰው ሃብት እና ብቃት" }, description:{ en:"Sector managing human resources, training and staff competency development.", am:"የሰው ሃብት አስተዳደር፣ ሥልጠና እና የሠራተኞች ብቃት ማሳደጊያ ዘርፍ።" } },
  { id:6, name:{ en:"Operations & Services", am:"ሥራ አፈጻጸም እና አገልግሎቶች" }, description:{ en:"Sector managing general services, maintenance and operations of the Ministry.", am:"የሚኒስቴሩን አጠቃላይ አገልግሎቶች፣ ጥገና እና ሥራ አፈጻጸም የሚያስተዳድር ዘርፍ።" } },
  { id:7, name:{ en:"Digital & ICT", am:"ዲጂታል እና ኢሲቲ" }, description:{ en:"Sector providing ICT infrastructure, e-government and digital economy services.", am:"የኢሲቲ መሠረተ ልማት፣ ኢ-መንግሥት እና ዲጂታል ኢኮኖሚ አገልግሎቶችን የሚያቀርብ ዘርፍ።" } },
  { id:8, name:{ en:"Support Services", am:"ድጋፍ አገልግሎቶች" }, description:{ en:"Sector providing data center, conference hall and media services.", am:"የዳታ ማዕከል፣ ኮንፈረንስ አዳራሽ እና ሚዲያ አገልግሎቶችን የሚያቀርብ ዘርፍ።" } },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  for (const s of data) {
    await Sector.findOneAndUpdate({ id: s.id }, { $set: { name: s.name, description: s.description } });
    console.log(`✅ Sector ${s.id}: ${s.name.en}`);
  }
  await mongoose.disconnect();
  console.log("Done.");
}
run().catch(e => { console.error(e); process.exit(1); });
