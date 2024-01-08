import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../components/ui/dialog";
  
  export default function QqDialog() {
    return (
        <Dialog>
        <DialogTrigger>
            <a className='hover:bg-[#006db5] w-[120px] rounded p-2 bg-[#2eabff] text-white flex justify-center items-center' href='javascript:void(0);'>
                <span className='mr-2 flex justify-center items-center'>
                    <svg fill='#fff' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5033" width="20" height="20"><path d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z" p-id="5034"></path></svg>
                </span>
                <span>QQ</span>
            </a>
        </DialogTrigger>
        <DialogContent>
        <DialogHeader>
            <DialogTitle className="mb-4 ">QQ</DialogTitle>
        </DialogHeader>
        <div>
            <img className="w-48" src="/qq.png" />
        </div>
        </DialogContent>
    </Dialog>
    );
  }
  