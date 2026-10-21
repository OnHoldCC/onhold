import original from './assets/welcome/claude-code-girl-1024.webp';
import originalSmall from './assets/welcome/claude-code-girl-640.webp';
import teacher from './assets/welcome/teacher-1024.webp';
import teacherSmall from './assets/welcome/teacher-640.webp';
import student from './assets/welcome/student-1024.webp';
import studentSmall from './assets/welcome/student-640.webp';
import sister from './assets/welcome/sister-1024.webp';
import sisterSmall from './assets/welcome/sister-640.webp';
import {portraitClipPath,portraitClipPaths} from './portrait-shape.mjs';

export const welcomePortraits=[
  {id:'original',src:original,small:originalSmall,clipPath:portraitClipPath},
  {id:'teacher',src:teacher,small:teacherSmall,clipPath:portraitClipPaths.teacher},
  {id:'student',src:student,small:studentSmall,clipPath:portraitClipPaths.student},
  {id:'sister',src:sister,small:sisterSmall,clipPath:portraitClipPaths.sister},
];
