import { Receipt, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Kelola expense dan reimbursement Anda
          </p>
        </div>
        <Button>
          <Receipt className="mr-2 h-4 w-4" />
          Submit New Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Menunggu approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">
              Menunggu pembayaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 12.5M</div>
            <p className="text-xs text-muted-foreground">
              Total dibayar bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reimbursements */}
      <Card>
        <CardHeader>
          <CardTitle>My Reimbursements</CardTitle>
          <CardDescription>
            Status reimbursement terbaru Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "RMB-015",
                project: "Website Redesign PT ABC",
                description: "Transport & Akomodasi Meeting Client",
                amount: "Rp 1.500.000",
                date: "10 Nov 2025",
                status: "PENDING",
              },
              {
                id: "RMB-014",
                project: "Mobile App Development",
                description: "Material & Tools Development",
                amount: "Rp 750.000",
                date: "09 Nov 2025",
                status: "APPROVED",
              },
              {
                id: "RMB-013",
                project: "System Integration",
                description: "Equipment Purchase",
                amount: "Rp 2.000.000",
                date: "08 Nov 2025",
                status: "PAID",
              },
              {
                id: "RMB-012",
                project: "Website Redesign PT ABC",
                description: "Hosting & Domain",
                amount: "Rp 500.000",
                date: "07 Nov 2025",
                status: "REJECTED",
              },
            ].map((reimburse) => {
              const statusConfig = {
                PENDING: { color: "text-yellow-600", bg: "bg-yellow-100", icon: Clock },
                APPROVED: { color: "text-green-600", bg: "bg-green-100", icon: CheckCircle },
                PAID: { color: "text-blue-600", bg: "bg-blue-100", icon: CheckCircle },
                REJECTED: { color: "text-red-600", bg: "bg-red-100", icon: XCircle },
              }
              const config = statusConfig[reimburse.status as keyof typeof statusConfig]
              const StatusIcon = config.icon

              return (
                <div
                  key={reimburse.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{reimburse.project}</p>
                      <span className="text-xs text-muted-foreground">({reimburse.id})</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{reimburse.description}</p>
                    <p className="text-xs text-muted-foreground">{reimburse.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">{reimburse.amount}</p>
                    <div className={`flex items-center gap-1 rounded-full px-3 py-1 ${config.bg}`}>
                      <StatusIcon className={`h-3 w-3 ${config.color}`} />
                      <span className={`text-xs font-medium ${config.color}`}>
                        {reimburse.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Aksi cepat yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Receipt className="mr-2 h-4 w-4" />
              Submit New Reimbursement
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              View All Expenses
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Account Info</CardTitle>
            <CardDescription>Informasi rekening untuk reimbursement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bank Name:</span>
              <span className="font-medium">BCA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Number:</span>
              <span className="font-medium">1234567890</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Name:</span>
              <span className="font-medium">John Doe</span>
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              Update Bank Info
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
