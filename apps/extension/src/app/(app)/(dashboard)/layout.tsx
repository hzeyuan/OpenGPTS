import DefaultLayout from '~src/app/layout/DefaultLayout';
export default function DashboardLayout({
  children,
  params: {
    lng
  }
}: {
  children: React.ReactNode,
  params: {
    lng: string
  }
}) {
  return (
   <DefaultLayout lng={lng}>
    {children}
   </DefaultLayout>
  )
}
