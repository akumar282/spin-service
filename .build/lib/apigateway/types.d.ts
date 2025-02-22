import * as z from 'zod';
export declare const HttpMethod: z.ZodEnum<["GET", "HEAD", "POST", "PUT", "PATCH", "OPTIONS", "DELETE", "CONNECT", "TRACE"]>;
export type HttpMethod = z.infer<typeof HttpMethod>;
export type Records = {
    id: string;
    album: string;
    artist: string;
    year: string;
    media: 'cd' | 'vinyl';
    color: string;
    label: string;
    raw_post_title: string;
    raw_content: string;
    raw_link: string;
    post_time: Date;
    postId: string;
};
//# sourceMappingURL=types.d.ts.map