import { Gizmo } from "@opengpts/types";
import { insertRow, findByUuid } from "../../../(header)/models/gpts";
export async function POST(req: Request) {
    try {
        const { gizmo }: {
            gizmo: Gizmo
        } = await req.json();

        const gpts = await findByUuid(gizmo.id);

        console.log('gpts', gpts)

        if (gpts) {
            return Response.json({ code: -1, message: `This GPT ${gpts.uuid} is Exist`, });
        }

        const newGpts = {
            uuid: gizmo.id,
            org_id: gizmo.organization_id,
            name: gizmo.display.name,
            description: gizmo.display.description,
            avatar_url: gizmo.display?.profile_picture_url || '',
            short_url: gizmo.short_url,
            author_id: gizmo.author.user_id,
            author_name: gizmo.author.display_name,
            created_at: new Date().toISOString(),
            updated_at: gizmo.updated_at,
            detail: JSON.stringify(gizmo),
        }
        await insertRow(newGpts);
        return Response.json({ code: 0, message: "ok", data: gpts });
    } catch (e) {
        console.log("get gpts failed: ", e);
        return Response.json({
            code: -1,
            message: 'get gpts failed',
        });
    }
}
