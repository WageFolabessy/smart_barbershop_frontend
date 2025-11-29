'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import api from '@/lib/axios';
import { HairRecord } from '@/types/api';
import { assetUrl } from '@/lib/utils';

export default function GalleryPage() {
    const { data: records, isLoading } = useQuery({
        queryKey: ['hair-records'],
        queryFn: async () => {
            const res = await api.get<{ data: HairRecord[] }>('/api/hair-records');
            return res.data.data;
        },
    });

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">My Hair Journey</h1>
                <p className="text-muted-foreground">Koleksi transformasi gaya rambut Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records?.map((record, idx) => (
                    <Card key={record.id} className="overflow-hidden group hover:border-primary transition-colors">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{record.hair_type || 'Gaya Rambut'}</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(record.created_at), 'd MMMM yyyy', { locale: id })}
                                    </p>
                                </div>
                                <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                    by {record.barber.name}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                                {record.photos?.before && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className="aspect-square relative rounded-md overflow-hidden cursor-pointer bg-muted">
                                                <Image
                                                    src={assetUrl(record.photos.before)}
                                                    alt="Hair cut before transformation"
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                                    loading={idx < 6 ? 'eager' : 'lazy'}
                                                    priority={idx < 6}
                                                    unoptimized
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center">
                                                    Before
                                                </div>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black">
                                            <DialogHeader className="sr-only">
                                                <DialogTitle>Foto Sebelum</DialogTitle>
                                                <DialogDescription>Pratinjau ukuran penuh gambar sebelum perubahan gaya rambut.</DialogDescription>
                                            </DialogHeader>
                                            <Image src={assetUrl(record.photos.before)} alt="Before transformation - full view" width={1200} height={1200} className="w-full h-auto" loading="lazy" unoptimized />
                                        </DialogContent>
                                    </Dialog>
                                )}
                                {record.photos.after && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className="aspect-square relative rounded-md overflow-hidden cursor-pointer bg-muted">
                                                <Image
                                                    src={assetUrl(record.photos.after)}
                                                    alt="Hair cut after transformation"
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                                    loading={idx < 6 ? 'eager' : 'lazy'}
                                                    priority={idx < 6}
                                                    unoptimized
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 text-center">
                                                    After
                                                </div>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black">
                                            <DialogHeader className="sr-only">
                                                <DialogTitle>Foto Sesudah</DialogTitle>
                                                <DialogDescription>Pratinjau ukuran penuh gambar setelah perubahan gaya rambut.</DialogDescription>
                                            </DialogHeader>
                                            <Image src={assetUrl(record.photos.after)} alt="After transformation - full view" width={1200} height={1200} className="w-full h-auto" loading="lazy" unoptimized />
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            {(record.treatment_notes || record.barber_recommendations) && (
                                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                                    {record.treatment_notes && <p><strong>Catatan:</strong> {record.treatment_notes}</p>}
                                    {record.barber_recommendations && <p className="mt-1"><strong>Saran:</strong> {record.barber_recommendations}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {records?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Belum ada riwayat gaya rambut.</p>
                    <p className="text-sm">Selesaikan booking pertama Anda untuk melihat galeri ini.</p>
                </div>
            )}
        </div>
    );
}
