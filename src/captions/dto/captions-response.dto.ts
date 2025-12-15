export class CaptionsResponseDto {
    status: 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'CANCELLED'
    id: string
    video_id: string
    created_at: number
    model: string
    object?: 'video'
    progress?: number | null
    completed_at?: number
    error?: {
        code: string
        message: string
    }
}
