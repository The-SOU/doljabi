import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const key = envContent.split("GEMINI_API_KEY=")[1]?.split("\n")[0]?.trim();
const ai = new GoogleGenAI({ apiKey: key! });

const samples = [
  {
    id: "sample1",
    prompt: "A photorealistic portrait photo of a cute 1-year-old Korean baby boy with chubby cheeks, big round eyes, and a bright happy smile. Wearing a traditional Korean hanbok (light blue). Clean white background, studio lighting. Shot on Canon EOS R5, 85mm lens.",
  },
  {
    id: "sample2",
    prompt: "A photorealistic portrait photo of an adorable 1-year-old Korean baby girl with soft features, small nose, and curious expression. Wearing a traditional Korean hanbok (pink). Clean white background, studio lighting. Shot on Canon EOS R5, 85mm lens.",
  },
  {
    id: "sample3",
    prompt: "A photorealistic portrait photo of a cheerful 1-year-old Korean baby with round face, dimples, and a laughing expression. Wearing a cute yellow outfit. Clean white background, studio lighting. Shot on Canon EOS R5, 85mm lens.",
  },
];

async function main() {
  const outDir = path.resolve(__dirname, "../public/images/samples");
  fs.mkdirSync(outDir, { recursive: true });

  for (const sample of samples) {
    console.log(`Generating ${sample.id}...`);
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: sample.prompt,
        config: { numberOfImages: 1 },
      });

      if (response.generatedImages?.[0]?.image?.imageBytes) {
        const imgPath = path.join(outDir, `${sample.id}.png`);
        fs.writeFileSync(imgPath, Buffer.from(response.generatedImages[0].image.imageBytes, "base64"));
        console.log(`  Saved: ${imgPath}`);
      }
    } catch (e) {
      console.error(`  Failed: ${(e as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log("Done!");
}

main();
