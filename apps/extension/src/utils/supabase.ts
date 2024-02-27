import type { Database } from '@opengpts/types/supabase'
import { createClient } from '@supabase/supabase-js'



const suspabse_url = process.env.PLASMO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const suspabse_public_key = process.env.PLASMO_PUBLIC_SUSPABASE_API_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient<Database>(suspabse_url!, suspabse_public_key!)



async function updateOrInsertActivity(payload: {
    taskId?: string
    task: string,
    actionList: any
    observationList: any
    thoughtList: any
}
) {
    // const data = {
    //     task,
    //     action_list: scenario['actionList'],
    //     observation_list: scenario['observationList'],
    //     thought_list: scenario['thoughtList']
    // };
    const needUpdateData = {
        task: payload.task,
        action_list: payload?.actionList,
        observation_list: payload?.observationList,
        thought_list: payload?.thoughtList
    }
    console.log('待更新数据', payload)

    // Check if it's a new entry
    if (!payload?.taskId) {
        // Insert the new data
        const { data, error } = await supabase.from('rpa_website_activity').insert([needUpdateData]).select();
        // Check for errors
        if (error) throw error
        console.log('get Data', data)
        return data[0]

    } else {
        // Update existing data
        const { data, error } = await supabase.from('rpa_website_activity').update(needUpdateData).eq('task_id', payload.taskId).select();
        console.log('打印更新后的数据', data)
        if (error) throw error
        console.log('Updated data', data, error);
        return data;
    }
}




export default supabase

export {
    updateOrInsertActivity
}