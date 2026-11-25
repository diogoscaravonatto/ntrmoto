import sharp from "sharp";
import path from "path";

const inputPath = path.join("src", "assets", "images", "r4t_image2.png");
const outputPath = path.join("src", "assets", "images", "r4t_image2.webp");

sharp(inputPath)
  .webp({ quality: 90 })
  .toFile(outputPath)
  .then((info) => {
    console.log("r4t_image2 convertida com sucesso:", info);
  })
  .catch((err) => {
    console.error("Erro ao converter imagem:", err);
  });
