import { NextRequest as OriginalNextRequest } from 'next/server'

declare global {
    declare interface NextRequest extends OriginalNextRequest {
        user?: any
    }
}