export interface FAQ {
  question: string;
  answer: string;
}

export const POPULAR_BRANDS: string[] = [
  'Fiat', 'Volkswagen', 'Chevrolet', 'Ford', 'Toyota', 
  'Hyundai', 'Honda', 'Renault', 'Jeep', 'Nissan',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Land Rover'
];

export const POPULAR_CITIES: any[] = [];

export const BRAND_CONTENT: Record<string, any> = {
  fiat: {
    intro: 'A Fiat é uma das marcas mais tradicionais no Brasil, conhecida pela economia e robustez.',
    popularModels: ['Uno', 'Palio', 'Strada', 'Argo', 'Cronos'],
    faq: [
      { question: 'Qual o carro mais vendido da Fiat?', answer: 'Atualmente a Fiat Strada é um dos modelos mais vendidos do Brasil.' }
    ]
  }
};

export const LOCATION_CONTENT: Record<string, any> = {};
