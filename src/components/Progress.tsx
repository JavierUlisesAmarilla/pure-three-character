import classNames from 'classnames'
import {LegacyRef} from 'react'

export const Progress = ({
  progressBarRef,
  className,
}: {
  progressBarRef?: LegacyRef<HTMLDivElement>;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
          'h-2 rounded-full border border-yellow-500 bg-white',
          className,
          {'w-full': !className},
      )}
    >
      <div
        ref={progressBarRef}
        className="h-full w-full origin-top-left scale-0 rounded-full bg-yellow-500"
      />
    </div>
  )
}
