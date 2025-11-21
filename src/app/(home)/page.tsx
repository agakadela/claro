import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function Home() {
  return (
    <div className='flex flex-col gap-y-4 p-8'>
      <div>
        <Button variant='elevated'>Click me</Button>
      </div>
      <div>
        <Input type='text' placeholder='Enter your name' />
      </div>
      <div>
        <Progress value={50} />
      </div>
      <div>
        <Textarea placeholder='Enter your message' />
      </div>
      <div>
        <Checkbox id='terms' name='terms' value='terms' />
      </div>
    </div>
  );
}
