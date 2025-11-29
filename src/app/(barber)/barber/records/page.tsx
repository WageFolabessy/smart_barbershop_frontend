"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { assetUrl } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/axios";
import { HairRecord } from "@/types/api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

export default function BarberRecordsPage() {
  const queryClient = useQueryClient();
  const [editingRecord, setEditingRecord] = useState<HairRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<HairRecord | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: hairRecords, isLoading: isLoadingRecords } = useQuery<HairRecord[]>({
    queryKey: ["hair-records"],
    queryFn: async () => {
      const res = await api.get<{ data: HairRecord[] }>("/api/hair-records");
      return res.data.data;
    },
  });

  const getErrorMessage = (error: unknown): string | undefined => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const errObj = error as { response?: { data?: { message?: string } }; message?: string };
      return errObj.response?.data?.message || errObj.message;
    }
    return undefined;
  };

  const editRecordMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!editingRecord) return;
      formData.append("_method", "PUT");
      await api.post(`/api/hair-records/${editingRecord.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Record berhasil diperbarui!");
      setIsEditOpen(false);
      setEditingRecord(null);
      queryClient.invalidateQueries({ queryKey: ["hair-records"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "Gagal memperbarui record");
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/hair-records/${id}`);
    },
    onSuccess: () => {
      toast.success("Record berhasil dihapus!");
      setIsDeleteOpen(false);
      setDeletingRecord(null);
      queryClient.invalidateQueries({ queryKey: ["hair-records"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || "Gagal menghapus record");
    },
  });

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    editRecordMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Riwayat Cukur</h1>
        <p className="text-muted-foreground">Kelola hasil cukur yang telah diupload.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Hasil Cukur</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRecords ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
          ) : !hairRecords || hairRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Belum ada data riwayat cukur.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hairRecords.map((record) => (
                <Card key={record.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    {record.photos?.after ? (
                      <Image
                        src={assetUrl(record.photos.after)}
                        alt="Hair cut result - After"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => {
                        setEditingRecord(record);
                        setIsEditOpen(true);
                      }} aria-label="Edit hair record">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => {
                        setDeletingRecord(record);
                        setIsDeleteOpen(true);
                      }} aria-label="Delete hair record">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold">{record.customer?.name || 'Pelanggan'}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(record.created_at), 'd MMM yyyy', { locale: id })}
                    </p>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Jenis:</span> {record.hair_type || '-'}</p>
                      <p className="truncate"><span className="font-medium">Catatan:</span> {record.treatment_notes || '-'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Record Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Hasil Cukur</DialogTitle>
            <DialogDescription>Perbarui data riwayat cukur pelanggan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-before">Foto Before (Opsional)</Label>
                <Input id="edit-before" name="photo_before" type="file" accept="image/*" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-after">Foto After (Opsional)</Label>
                <Input id="edit-after" name="photo_after" type="file" accept="image/*" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hair_type">Jenis Rambut</Label>
              <Input id="edit-hair_type" name="hair_type" defaultValue={editingRecord?.hair_type || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-scalp_condition">Kondisi Kulit Kepala</Label>
              <Input id="edit-scalp_condition" name="scalp_condition" defaultValue={editingRecord?.scalp_condition || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Catatan Perawatan</Label>
              <Textarea id="edit-notes" name="treatment_notes" defaultValue={editingRecord?.treatment_notes || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-recommendations">Saran untuk Pelanggan</Label>
              <Textarea id="edit-recommendations" name="barber_recommendations" defaultValue={editingRecord?.barber_recommendations || ''} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={editRecordMutation.isPending}>
                {editRecordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editRecordMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Riwayat?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data riwayat cukur ini akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingRecord) deleteRecordMutation.mutate(deletingRecord.id);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteRecordMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
