import {v2} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const cloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        //upload the file to cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            folder: 'uploads'
        });
        //file has been uploaded
        console.log('File uploaded to Cloudinary:', result);
        return result.secure_url; // return the secure URL of the uploaded file
    }catch(error) {
        fs.unlinkSync(localFilePath); // delete the file from local storage it just remove the locally save tmeporary file as the file upload operation failed
        // log the error
        console.error('Error uploading file to Cloudinary:', error);
        throw error;
    }
};

export default cloudinary;