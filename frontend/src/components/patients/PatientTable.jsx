import { Link } from 'react-router-dom'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

export default function PatientTable({ patients, onDelete, onToggleStatus }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>NIC</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const user = patient.user
            return (
              <TableRow key={patient._id}>
                <TableCell className="font-medium">
                  <Link
                    to={`/patients/${patient._id}`}
                    className="text-primary hover:underline"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.nic}</TableCell>
                <TableCell>
                  {new Date(user.dob).toLocaleDateString()}
                </TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      user.isActive
                        ? 'border-green-500 bg-green-50 text-green-600'
                        : 'border-red-400 bg-red-50 text-red-600'
                    }
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                      onClick={() => onToggleStatus(patient._id, user.isActive)}
                    >
                      {user.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/patients/${patient._id}/edit`}>
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(patient._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
