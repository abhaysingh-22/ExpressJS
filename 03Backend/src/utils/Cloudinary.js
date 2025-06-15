import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadToCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        //upload the file to cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", result.url);
        fs.unlinkSync(localFilePath)
        return result;
    }catch(error) {
        
        fs.unlinkSync(localFilePath); // delete the file from local storage it just remove the locally save tmeporary file as the file upload operation failed
        // log the error
        console.error('Error uploading file to Cloudinary:', error);
        // throw error;
        return null;
    }
};

export default uploadToCloudinary;