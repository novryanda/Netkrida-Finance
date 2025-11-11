import { Wallet, FileText, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FinanceDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
        <p className="text-muted-foreground">
          Kelola pembayaran dan reimbursement yang sudah di-approve
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Reimbursements</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Siap untuk dibayar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 8.5M</div>
            <p className="text-xs text-muted-foreground">
              Yang harus dibayar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Rp 35.2M dibayarkan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Dalam proses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Approved Reimbursements */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Reimbursements - Siap Dibayar</CardTitle>
          <CardDescription>
            Reimbursement yang sudah di-approve Admin dan menunggu pembayaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "RMB-001",
                staff: "John Doe",
                amount: "Rp 1.500.000",
                description: "Transport & Akomodasi - Project Website ABC",
                approvedDate: "10 Nov 2025",
                bankAccount: "BCA - 1234567890",
              },
              {
                id: "RMB-002",
                staff: "Jane Smith",
                amount: "Rp 750.000",
                description: "Material Project - Mobile App XYZ",
                approvedDate: "10 Nov 2025",
                bankAccount: "Mandiri - 9876543210",
              },
              {
                id: "RMB-003",
                staff: "Bob Wilson",
                amount: "Rp 2.000.000",
                description: "Equipment Purchase - System Integration",
                approvedDate: "09 Nov 2025",
                bankAccount: "BNI - 5555666677",
              },
            ].map((reimburse) => (
              <div
                key={reimburse.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{reimburse.staff}</p>
                    <span className="text-xs text-muted-foreground">({reimburse.id})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{reimburse.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Approved: {reimburse.approvedDate}</span>
                    <span>•</span>
                    <span>{reimburse.bankAccount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{reimburse.amount}</p>
                  </div>
                  <Button size="sm">Process Payment</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Pembayaran yang sudah selesai bulan ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: "PAY-045",
                staff: "Alice Johnson",
                amount: "Rp 3.200.000",
                description: "Design Materials",
                paidDate: "09 Nov 2025",
              },
              {
                id: "PAY-044",
                staff: "Charlie Brown",
                amount: "Rp 1.800.000",
                description: "Development Tools",
                paidDate: "08 Nov 2025",
              },
            ].map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{payment.staff}</p>
                    <span className="text-xs text-muted-foreground">({payment.id})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{payment.description}</p>
                  <p className="text-xs text-muted-foreground">Paid: {payment.paidDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{payment.amount}</p>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
