import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';


export default function DatePicker({ value, onChange }: { value: string|number; onChange: (value: string | number) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!value}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                >
                    <CalendarIcon />
                    {value ? format(new Date(value), 'PPP') : 'Datum wählen'}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={new Date(value)}
                    onSelect={date => onChange?.(format(date, 'yyyy-MM-dd'))}
                />
            </PopoverContent>
        </Popover>
    );
}
