declare module '@ffmpeg/ffmpeg' {
  export class FFmpeg {
    load(config?: { coreURL?: string; wasmURL?: string }): Promise<void>;
    writeFile(name: string, data: Uint8Array): Promise<void>;
    readFile(name: string): Promise<Uint8Array>;
    deleteFile(name: string): Promise<void>;
    exec(args: string[]): Promise<number>;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
  }
}

declare module '@ffmpeg/util' {
  export function fetchFile(file: File | Blob | string): Promise<Uint8Array>;
  export function toBlobURL(url: string, mimeType: string): Promise<string>;
}