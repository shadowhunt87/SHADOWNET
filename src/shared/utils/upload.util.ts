import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

// Configuración de almacenamiento para avatars
export const avatarStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/avatars';
    
    // Asegurarse de que la carpeta existe
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, callback) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueName);
  },
});

// Filtro para archivos de imagen
export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return callback(
      new BadRequestException('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)'),
      false,
    );
  }
  
  // Verificar tipo MIME
  if (!file.mimetype.startsWith('image/')) {
    return callback(
      new BadRequestException('El archivo debe ser una imagen'),
      false,
    );
  }
  
  callback(null, true);
};

// ✅ NUEVO: Configuración para otros tipos de uploads
export const missionStorage = diskStorage({
  destination: './uploads/missions',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ✅ NUEVO: Validar tamaño máximo de archivo
export const maxFileSize = 5 * 1024 * 1024; // 5MB