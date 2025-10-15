'use client';

import { BaseChat } from '@/components/chat/BaseChat';
import { Suspense, useEffect } from 'react';
import VisualEditorWrap from '@/components/VisualEditorWrap';
import { WorkbenchHeader } from '@/components/header/WorkbenchHeader';

export default function Home() {
  return (
    <>
    <WorkbenchHeader />
    <div className="flex flex-col h-full w-full">
      <Suspense fallback={<BaseChat />}>
        <VisualEditorWrap />
      </Suspense>
    </div>
    </>
  );
}