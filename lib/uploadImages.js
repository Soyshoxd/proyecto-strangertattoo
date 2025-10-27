import axios from 'axios';

const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'imagenes-stranger'); // Reemplaza con tu preset real

  const response = await axios.post(
    'https://api.cloudinary.com/v1_1/dekp6sq67/image/upload', // Reemplaza también
    formData
  );

  return response.data.secure_url;
};

export default uploadImageToCloudinary;
