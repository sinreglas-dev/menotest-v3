import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verificarCredencialesEspecialista } from '@/shared/data/repositorioEspecialistas';
import { crearSesionEspecialista } from '@/shared/auth/sesionEspecialista';

export async function POST(peticion: NextRequest) {
   try {
      const { correo, password } = await peticion.json();

      if (!correo || !password) {
         return NextResponse.json({ error: 'Correo y contraseña requeridos' }, { status: 400 });
      }

      const especialista = await verificarCredencialesEspecialista(correo);

      if (!especialista || !bcrypt.compareSync(password, especialista.password_hash)) {
         return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
      }

      await crearSesionEspecialista(especialista.id);
      return NextResponse.json({ ok: true, nombre: especialista.nombre });
   } catch (error: any) {
      console.error('[POST /api/especialista/login]', error);
      return NextResponse.json({ error: 'Error interno' }, { status: 500 });
   }
}