import fs from "fs";
import path from "path";

const unlinkFile = (file: string) => {
  try {
    const filePath = path.join("uploads", file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.log("error from unlink file", error);
  }
};

export default unlinkFile;
