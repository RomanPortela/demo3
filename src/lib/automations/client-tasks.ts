import { Client, Task } from "@/types";
import { isSameDay, subYears, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";

export async function checkClientAutomations() {
    console.log("Checking client automations...");
    const supabase = createClient();

    // 1. Fetch all clients
    const { data: clients, error } = await supabase.from('clients').select('*');
    if (error || !clients) {
        console.error("Error fetching clients for automation:", error);
        return;
    }

    // 2. Fetch existing tasks to avoid duplicates today
    const { data: tasks } = await supabase.from('tasks').select('*');

    const today = new Date();
    const newTasks: Partial<Task>[] = [];

    clients.forEach(client => {
        // A. Transaction Anniversary Check
        // Assuming last_transaction_date is when they bought/rented
        if (client.last_transaction_date) {
            const transDate = parseISO(client.last_transaction_date);
            // Check if today is same month and day as transaction date
            // WE check if it matches ANY year anniversary (1 year, 2 years, etc)
            // Simple way: see if month and date are same

            if (transDate.getDate() === today.getDate() && transDate.getMonth() === today.getMonth()) {
                const years = today.getFullYear() - transDate.getFullYear();
                if (years > 0) {
                    const taskTitle = `Felicitar a ${client.owner_first_name || 'Cliente'} por ${years}° Aniversario`;
                    const exists = tasks?.some(t => t.title === taskTitle && isSameDay(parseISO(t.created_at), today));

                    if (!exists) {
                        newTasks.push({
                            title: taskTitle,
                            description: `Se cumple un año más de su operación (${client.property_type}). Enviar saludo o regalo.`,
                            importance: 'alta',
                            status: 'pendiente',
                            due_date: new Date().toISOString(),
                            priority: 'alta', // using priority as importance mapping if needed, or stick to importance enum
                            assigned_to: 'user_id' // ideally assigned to client's agent
                        } as any);
                    }
                }
            }
        }
    });

    // 3. Insert new tasks
    if (newTasks.length > 0) {
        console.log(`Creating ${newTasks.length} automated tasks...`);
        // We'd need to insert these. Supabase 'tasks' table structure:
        // id, title, status, importance, due_date, created_at

        // Note: We need to handle 'assigned_to'. For now, we leave it null or pick a default if known.
        // Also 'description' might not exist in Task type, mapped to 'notes'

        const tasksToInsert = newTasks.map(t => ({
            title: t.title,
            notes: (t as any).description,
            importance: 'alta',
            status: 'pendiente',
            due_date: t.due_date,
            position: 0
        }));

        await supabase.from('tasks').insert(tasksToInsert);
    }
}
