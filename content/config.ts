import { defineCollection } from "astro:content";
import { blogSchema } from "../schemas/blogSchema";
import { storeSchema } from "../schemas/storeSchema";
import { cvSchema } from "../schemas/cvSchema";
import { projectSchema } from "../schemas/projectSchema";
import { serviceSchema } from "../schemas/serviceSchema";


const blogCollection = defineCollection({ schema: blogSchema });
const projectCollection = defineCollection({ schema: projectSchema });
const storeCollection = defineCollection({ schema: storeSchema });
const cvCollection = defineCollection({ schema: cvSchema });
const serviceCollection = defineCollection({ schema: serviceSchema });

export const collections = {
    'blog': blogCollection,
    'project': projectCollection,
    'service': serviceCollection,
    'store': storeCollection,
    'cv': cvCollection
}