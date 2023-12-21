export function OnboardingNote() {
  return (
    <div className="flex flex-col space-y-4 bg-sky-200 p-2 rounded text-slate-700 text-sm">
      <span>
       体验ant-codeAI，花费预估10元/20次生成
       <p>
       (只体验不可超过10元)<span className="text-red-600">不退款</span>
       </p>
       <p>wx：sparrow777-js</p>
       如有openAI API key自行设置使用即可。
      </span>
    </div>
  );
}
