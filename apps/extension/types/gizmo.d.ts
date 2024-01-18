interface Author {
    user_id: string;
    display_name: string;
    link_to: null | string;
    selected_display: string;
    is_verified: boolean;
    will_receive_support_emails: null | boolean;
}

interface Voice {
    id: string;
}

interface Display {
    name: string;
    description: string;
    welcome_message: string;
    prompt_starters: string[];
    profile_picture_url: null | string;
    categories: string[];
}

interface VanityMetrics {
    num_conversations_str: string;
    num_pins: number;
    num_users_interacted_with: number;
}

interface Gizmo {
    id: string;
    organization_id: string;
    short_url: string;
    author: Author;
    voice: Voice;
    workspace_id: null | string;
    model: null | string;
    instructions: string;
    settings: object;
    display: Display;
    share_recipient: string;
    updated_at: string;
    last_interacted_at: null | string;
    tags: string[];
    version: number;
    live_version: number;
    training_disabled: boolean;
    allowed_sharing_recipients: string[];
    review_info: null | object;
    appeal_info: null | object;
    vanity_metrics: VanityMetrics;
    workspace_approved: null | boolean;
}
