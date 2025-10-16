// ============================================
// SEED DE DATOS INICIALES - LA COLMENA
// ============================================

import { PrismaClient, UserRole, PaymentFrequency, CommitmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lacolmena.edu' },
    update: {},
    create: {
      email: 'admin@lacolmena.edu',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      profile: {
        create: {
          firstName: 'Administrador',
          lastName: 'La Colmena',
          phone: '+54 11 1234-5678',
          address: 'Dirección de la escuela',
        }
      }
    },
    include: { profile: true }
  });

  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear año académico actual
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2024-2025' },
    update: {},
    create: {
      name: '2024-2025',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-02-28'),
      isActive: true
    }
  });

  console.log('✅ Año académico creado:', academicYear.name);

  // Crear maestros de ejemplo
  const teachers = [
    {
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@lacolmena.edu',
      specializations: ['Jardín de Infantes', 'Pedagogía Waldorf'],
      phone: '+54 11 2345-6789'
    },
    {
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@lacolmena.edu',
      specializations: ['Primer Grado', 'Música'],
      phone: '+54 11 3456-7890'
    },
    {
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@lacolmena.edu',
      specializations: ['Segundo Grado', 'Arte'],
      phone: '+54 11 4567-8901'
    }
  ];

  for (const teacherData of teachers) {
    const password = await bcrypt.hash('maestro123', 10);
    const teacher = await prisma.teacher.upsert({
      where: { email: teacherData.email },
      update: {},
      create: {
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        email: teacherData.email,
        phone: teacherData.phone,
        specializations: teacherData.specializations,
        hireDate: new Date('2024-01-01'),
        user: {
          create: {
            email: teacherData.email,
            passwordHash: password,
            role: UserRole.MAESTRO,
            profile: {
              create: {
                firstName: teacherData.firstName,
                lastName: teacherData.lastName,
                phone: teacherData.phone,
              }
            }
          }
        }
      },
      include: { user: { include: { profile: true } } }
    });

    console.log('✅ Maestro creado:', teacher.firstName, teacher.lastName);
  }

  // Crear familias de ejemplo
  const families = [
    {
      familyName: 'Familia García',
      contactEmail: 'garcia.familia@email.com',
      contactPhone: '+54 11 5678-9012',
      address: 'Av. Corrientes 1234, CABA',
      emergencyContactName: 'Juan García',
      emergencyContactPhone: '+54 11 5678-9013'
    },
    {
      familyName: 'Familia López',
      contactEmail: 'lopez.familia@email.com',
      contactPhone: '+54 11 6789-0123',
      address: 'Av. Santa Fe 5678, CABA',
      emergencyContactName: 'María López',
      emergencyContactPhone: '+54 11 6789-0124'
    },
    {
      familyName: 'Familia Fernández',
      contactEmail: 'fernandez.familia@email.com',
      contactPhone: '+54 11 7890-1234',
      address: 'Av. Córdoba 9012, CABA',
      emergencyContactName: 'Pedro Fernández',
      emergencyContactPhone: '+54 11 7890-1235'
    }
  ];

  for (const familyData of families) {
    const family = await prisma.family.upsert({
      where: { familyName: familyData.familyName },
      update: {},
      create: familyData
    });

    console.log('✅ Familia creada:', family.familyName);
  }

  // Crear estudiantes de ejemplo
  const familiesList = await prisma.family.findMany();
  const students = [
    {
      firstName: 'Sofia',
      lastName: 'García',
      birthDate: new Date('2018-05-15'),
      gender: 'FEMENINO' as const,
      grade: 'Jardín de Infantes',
      familyName: 'Familia García'
    },
    {
      firstName: 'Mateo',
      lastName: 'López',
      birthDate: new Date('2017-08-22'),
      gender: 'MASCULINO' as const,
      grade: 'Primer Grado',
      familyName: 'Familia López'
    },
    {
      firstName: 'Valentina',
      lastName: 'Fernández',
      birthDate: new Date('2016-12-03'),
      gender: 'FEMENINO' as const,
      grade: 'Segundo Grado',
      familyName: 'Familia Fernández'
    }
  ];

  for (const studentData of students) {
    const family = familiesList.find(f => f.familyName === studentData.familyName);
    if (family) {
      const student = await prisma.student.create({
        data: {
          familyId: family.id,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          birthDate: studentData.birthDate,
          gender: studentData.gender,
          grade: studentData.grade,
          enrollmentDate: new Date('2024-03-01')
        }
      });

      console.log('✅ Estudiante creado:', student.firstName, student.lastName);
    }
  }

  // Crear clases
  const teachersList = await prisma.teacher.findMany();
  const classes = [
    {
      name: 'Jardín de Infantes',
      teacherId: teachersList[0]?.id,
      maxStudents: 20
    },
    {
      name: 'Primer Grado',
      teacherId: teachersList[1]?.id,
      maxStudents: 25
    },
    {
      name: 'Segundo Grado',
      teacherId: teachersList[2]?.id,
      maxStudents: 25
    }
  ];

  for (const classData of classes) {
    const classCreated = await prisma.class.create({
      data: {
        academicYearId: academicYear.id,
        name: classData.name,
        teacherId: classData.teacherId,
        maxStudents: classData.maxStudents,
        description: `Clase de ${classData.name} - Pedagogía Waldorf`
      }
    });

    console.log('✅ Clase creada:', classCreated.name);
  }

  // Crear compromisos fraternos de ejemplo
  const studentsList = await prisma.student.findMany();
  const commitments = [
    {
      agreedAmount: 45000,
      suggestedAmount: 50000,
      paymentFrequency: PaymentFrequency.MENSUAL,
      status: CommitmentStatus.ACTIVO,
      studentName: 'Sofia García'
    },
    {
      agreedAmount: 42000,
      suggestedAmount: 50000,
      paymentFrequency: PaymentFrequency.MENSUAL,
      status: CommitmentStatus.ACTIVO,
      studentName: 'Mateo López'
    },
    {
      agreedAmount: 48000,
      suggestedAmount: 50000,
      paymentFrequency: PaymentFrequency.MENSUAL,
      status: CommitmentStatus.ACTIVO,
      studentName: 'Valentina Fernández'
    }
  ];

  for (const commitmentData of commitments) {
    const student = studentsList.find(s => 
      `${s.firstName} ${s.lastName}` === commitmentData.studentName
    );
    
    if (student) {
      const commitment = await prisma.fraternalCommitment.create({
        data: {
          familyId: student.familyId,
          studentId: student.id,
          academicYear: academicYear.name,
          agreedAmount: commitmentData.agreedAmount,
          suggestedAmount: commitmentData.suggestedAmount,
          paymentFrequency: commitmentData.paymentFrequency,
          status: commitmentData.status,
          commitmentDate: new Date('2024-02-15'),
          reviewDate: new Date('2024-08-15'),
          notes: 'Compromiso fraterno acordado en reunión familiar'
        }
      });

      console.log('✅ Compromiso fraterno creado para:', commitmentData.studentName);
    }
  }

  // Crear algunos pagos de ejemplo
  const commitmentsList = await prisma.fraternalCommitment.findMany();
  
  for (const commitment of commitmentsList) {
    // Crear pagos para los últimos 3 meses
    for (let i = 0; i < 3; i++) {
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() - i);
      
      const payment = await prisma.payment.create({
        data: {
          familyId: commitment.familyId,
          studentId: commitment.studentId,
          commitmentId: commitment.id,
          amount: commitment.agreedAmount,
          paymentDate: paymentDate,
          paymentMethod: 'TRANSFERENCIA',
          referenceNumber: `TRF${Date.now()}${i}`,
          monthPaid: `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`,
          recordedBy: admin.id,
          notes: 'Pago mensual - Sistema fraterno'
        }
      });

      console.log('✅ Pago creado para:', payment.monthPaid);
    }
  }

  // Crear algunos gastos de ejemplo
  const expenses = [
    {
      category: 'Salarios',
      subcategory: 'Salarios maestros',
      description: 'Salarios del mes de marzo',
      amount: 180000,
      expenseDate: new Date('2024-03-31'),
      paymentMethod: 'TRANSFERENCIA',
      vendor: 'Banco Nación',
      approvedBy: admin.id
    },
    {
      category: 'Materiales',
      subcategory: 'Materiales didácticos',
      description: 'Compra de materiales para jardín',
      amount: 25000,
      expenseDate: new Date('2024-03-15'),
      paymentMethod: 'TRANSFERENCIA',
      vendor: 'Librería Waldorf',
      approvedBy: admin.id
    },
    {
      category: 'Mantenimiento',
      subcategory: 'Limpieza',
      description: 'Servicio de limpieza mensual',
      amount: 15000,
      expenseDate: new Date('2024-03-20'),
      paymentMethod: 'EFECTIVO',
      vendor: 'Limpieza Total SRL',
      approvedBy: admin.id
    }
  ];

  for (const expenseData of expenses) {
    const expense = await prisma.expense.create({
      data: expenseData
    });

    console.log('✅ Gasto creado:', expense.description);
  }

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


