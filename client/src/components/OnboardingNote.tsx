export function OnboardingNote() {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm mx-auto ring-1 ring-slate-900/10">
        <div className="flex items-baseline space-x-2 mb-6">
          <span className="text-5xl font-bold">10元/20</span>
          <span className="text-gray-500">次预计生成</span>
        </div>
        <p className="text-gray-700 mb-6">
        不退款(初次使用体验不可超过10元)      
        </p>
        <hr className="mb-6"/>
        <div className="space-y-4">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-blue-600 mr-2"></i>
            <span>
              email: sparrowwht7@gmail.com
            </span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-infinity text-blue-600 mr-2"></i>
            <span>wx: sparrow777-js</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-users text-blue-600 mr-2"></i>
            <span>如有openAI API key自行设置使用即可。</span>
          </div>
        </div>
        <div className="flex absolute -bottom-px left-1/2 -ml-36 h-[2px] w-60">
          <div className="w-full flex-none blur-sm [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          <div className="-ml-[100%] w-full flex-none blur-[1px] [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          <div className="-ml-[100%] w-full flex-none blur-sm [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
          <div className="-ml-[100%] w-full flex-none blur-[1px] [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]"></div>
        </div>
      </div>
  );
}
