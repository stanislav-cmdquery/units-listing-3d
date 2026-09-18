'use client'

import clsx from 'clsx'

import { Circle } from '../Circle/Circle'
import './UnitParams.css'

type Props = {
  unitNumber?: string
  beds: number
  baths: number
  className?: string
}

export function UnitParams({ unitNumber, beds, baths, className }: Props) {
  return (
    <div className={clsx('ul-unit-params-params', className)}>
      {unitNumber && (
        <>
          <div className="ul-unit-params-item">{unitNumber}</div>
          <Circle className="ul-unit-params-circle" />
        </>
      )}
      <div className="ul-unit-params-item" title={beds === 0 ? 'Studio' : `${beds}-Bedroom`}>
        {beds === 0 ? 1 : beds}{' '}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <g clipPath="url(#up-bed)">
            <path
              d="M8.75 13.125V6.25H16.875C17.538 6.25 18.1739 6.51339 18.6428 6.98223C19.1116 7.45107 19.375 8.08696 19.375 8.75V13.125"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1.875 16.25V3.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1.875 13.125H19.375V16.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.75 6.25H1.875"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="up-bed">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <Circle className="ul-unit-params-circle" />
      <div className="ul-unit-params-item">
        {baths}{' '}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M5.625 15V16.875"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.375 15V16.875"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.625 7.5H10.625V11.25H15.625V7.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.625 8.125H18.75V11.25C18.75 12.2446 18.3549 13.1984 17.6517 13.9017C16.9484 14.6049 15.9946 15 15 15H5C4.00544 15 3.05161 14.6049 2.34835 13.9017C1.64509 13.1984 1.25 12.2446 1.25 11.25V8.125H10.625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.375 8.125V4.0625C4.375 3.6481 4.53962 3.25068 4.83265 2.95765C5.12567 2.66462 5.5231 2.5 5.9375 2.5C6.30139 2.49915 6.65466 2.6226 6.93881 2.84993C7.22297 3.07725 7.42096 3.3948 7.5 3.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
