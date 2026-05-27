import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import TitleBox from 'src/components/box/TitleBox';
import { Button } from 'src/components/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from 'src/components/shadcn/dialog';
import { useGetMe, useUserSendVerifyEmail } from 'src/queries/papp/user.query';
import { getAxiosError, getUserRole } from 'src/services';
import { useAuthStore } from 'src/states/auth.state';
import { USER_STATUS } from 'src/types/papp.type';

export default function AccountSetting() {
  const [open, setOpen] = useState(false);
  const { data } = useGetMe();
  const { fn } = useAuthStore();
  const router = useRouter();

  const { mutate } = useUserSendVerifyEmail({
    onSuccess: () => {
      toast.success('Go to your email');
    },
    onError: (error) => {
      toast.error(getAxiosError(error));
    },
  });

  function onLogout() {
    fn.clearAccessToken();
    router.push('/papp/login');
  }

  function onVerify() {
    mutate();
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <div
            className="bg-accent-foreground size-4 cursor-pointer rounded-full"
            onClick={() => setOpen(true)}
          />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>Account</DialogHeader>
          <div>
            <div className="flex flex-wrap items-center gap-10">
              <TitleBox title="Name" value={data?.name} />
              <TitleBox title="Email" value={data?.email} />
              <TitleBox title="Role" value={getUserRole(data?.role)} />
            </div>
            {data?.status == USER_STATUS.EMAIL_INACTIVE && (
              <Button className="mt-2" onClick={onVerify}>
                Verify Email
              </Button>
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
