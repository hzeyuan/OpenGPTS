/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
import { NextRequest as OriginalNextRequest } from 'next/server'

declare global {
    declare interface NextRequest extends OriginalNextRequest {
        user: any
    }
}