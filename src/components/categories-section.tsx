import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ApiCategory, getErrorMessage } from "../lib/api/index";
import { fetchCategoriesLocal } from "../lib/api/categories.server";
import { CategoryIcon } from "@/lib/utils/categoryIcon";

export async function CategoriesSection() {
  let categories: ApiCategory[] = [];
  let error: string | null = null;

  try {
    // Use Payload Local API directly to avoid fetch issues during build
    categories = await fetchCategoriesLocal();
  } catch (err) {
    error = getErrorMessage(err);
  }

  if (error) {
    return (
      <section id="categories" className="py-8 sm:py-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-8 sm:py-10 bg-background relative overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Выберите специалиста
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Найдите нужного врача по специализации и запишитесь на удобное время
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="group h-full py-0 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer hover:scale-[1.01]">
                  <CardContent className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <CategoryIcon category={category} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Категории пока не добавлены</p>
          </div>
        )}
      </div>
    </section>
  );
}
