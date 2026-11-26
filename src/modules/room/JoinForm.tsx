import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface JoinValues {
  meetingId: string;
  userId: string;
}

interface Props {
  defaultValues: JoinValues;
  onSubmit: (v: JoinValues) => void;
}

export default function JoinForm({ defaultValues, onSubmit }: Props) {
  const { register, handleSubmit } = useForm<JoinValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="meetingId">ID Meeting</Label>
        <Input id="meetingId" required {...register("meetingId")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userId">ID Pengguna</Label>
        <Input id="userId" required {...register("userId")} />
      </div>
      <Button type="submit" className="w-full">
        Masuk
      </Button>
    </form>
  );
}
