import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CustomerDetailsLoading(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton 
            className="h-9 w-48" 
            aria-label="Loading customer name"
          />
          <Skeleton 
            className="h-5 w-32 mt-2" 
            aria-label="Loading customer details"
          />
        </div>
        <Skeleton 
          className="h-10 w-24" 
          aria-label="Loading action button"
        />
      </div>

      <div className="space-y-4">
        <div className="flex space-x-4">
          <Skeleton 
            className="h-10 w-24" 
            aria-label="Loading navigation"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton 
                className="h-6 w-48" 
                aria-label="Loading section title"
              />
            </CardTitle>
            <CardDescription>
              <Skeleton 
                className="h-4 w-64" 
                aria-label="Loading section description"
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`field-${index}`} className="space-y-2">
                  <Skeleton 
                    className="h-4 w-20" 
                    aria-label={`Loading field label ${index + 1}`}
                  />
                  <Skeleton 
                    className="h-10 w-full" 
                    aria-label={`Loading field value ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton 
                className="h-4 w-20" 
                aria-label="Loading notes label"
              />
              <Skeleton 
                className="h-24 w-full" 
                aria-label="Loading notes content"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 