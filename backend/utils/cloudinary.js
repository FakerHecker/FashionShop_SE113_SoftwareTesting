import cloudinary from "cloudinary";

console.log(process.env.CLOUDINARY_CLOUD_NAME)

// dotenv.config({ path: "backend/config/config.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const upload_file = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({
          public_id: result.public_id,
          url: result.url,
        });
      },
      {
        resource_type: "auto",
        folder,
      }
    );
    // try {
    //   cloudinary.uploader.upload(
    //     file,
    //     (error, result) => {
    //       if (error) {
    //         console.error("Error uploading to Cloudinary:", error);
    //         reject(new Error("Failed to upload file to Cloudinary."));
    //       } else {
    //         resolve({
    //           public_id: result.public_id,
    //           url: result.url,
    //         });
    //       }
    //     },
    //     {
    //       resource_type: "auto",
    //       folder,
    //     }
    //   );
    // } catch (err) {
    //   console.error("Unexpected error in upload_file:", err);
    //   reject(new Error("Unexpected error occurred while uploading file."));
    // }
  });
}

export const delete_file = async(file) => {
  const res = await cloudinary.uploader.destroy(file)

  if(res?.result === "ok") return true;
}