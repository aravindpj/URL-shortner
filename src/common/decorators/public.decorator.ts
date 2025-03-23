import { SetMetadata } from '@nestjs/common';
export const PUBLIC_KEY = 'public_key';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
