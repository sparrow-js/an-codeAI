import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { RiMoneyDollarCircleFill } from "react-icons/ri";


export default function OnboardingNote() {
  return (
    <Dialog>
    <DialogTrigger className="rounded-sm w-full">
      <span className="hover:bg-slate-200 rounded-sm relative flex justify-center items-center">
        <span className="text-sm font-bold mr-2">try out</span>
        <RiMoneyDollarCircleFill className="text-xl"/>
      </span>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="mb-4 ">获取 KEY</DialogTitle>
      </DialogHeader>
      <div>
          <div className="flex items-baseline space-x-2 mb-6">
            <span className="text-5xl font-bold">10元/20</span>
            <span className="text-gray-500">次预计生成</span>
          </div>

          <hr className="mb-6"/>
          <div className="space-y-4">
            <p className="mb-3">
            1.如有openAI API key, GPT-4 Vision权限自行设置使用即可.
            </p>
          </div>
          <p className="text-gray-700 pb-2">
          2.初次使用体验不要超过10元,感觉对自己有用在继续使用。每天20:00前发送Key至邮箱.
          </p> 
          <p className="text-red-500 pb-2">
            备注一定要添加自己邮箱地址
          </p>
          <img className="w-48" src="/2421703471862_.pic.jpg" />
          <div className="flex items-center">
            <i className="fas fa-check-circle text-blue-600 mr-2"></i>
            <span>
              联系方式 email:  sparrowwht7@gmail.com
            </span>
          </div>
          <div className="flex absolute -bottom-px left-1/2 -ml-36 h-[2px] w-60">
            <div className="w-full flex-none blur-sm [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
            <div className="-ml-[100%] w-full flex-none blur-[1px] [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
            <div className="-ml-[100%] w-full flex-none blur-sm [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
            <div className="-ml-[100%] w-full flex-none blur-[1px] [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          </div>
      </div>
    </DialogContent>
    </Dialog>
  );
}
