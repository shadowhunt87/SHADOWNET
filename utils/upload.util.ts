import { diskStorage, StorageEngine } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';

// Configuración de almacenamiento para avatars
export const avatarStorage: StorageEngine = diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = './uploads/avatars';
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void
  ) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    callback(null, uniqueName);
  },
});

// Filtro para archivos de imagen
export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return callback(
      new BadRequestException('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)'),
      false,
    );
  }
  
  if (!file.mimetype.startsWith('image/')) {
    return callback(
      new BadRequestException('El archivo debe ser una imagen'),
      false,
    );
  }
  
  callback(null, true);
};

// Configuración para otros tipos de uploads
export const missionStorage: StorageEngine = diskStorage({
  destination: './uploads/missions',
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Validar tamaño máximo de archivo
export const maxFileSize = 5 * 1024 * 1024; // 5MB