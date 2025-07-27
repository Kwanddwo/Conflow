import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConflowReview() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-[#000000] mb-8">
          Your Review for Submission{" "}
          <span className="text-muted-foreground">54</span> of CONF2024
        </h1>

        {/* Paper Details */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-[#000000]">Title</span>
                <span className="text-[#000000]">
                  Neuro-Symbolic Integration for Zero-Shot Commonsense Reasoning
                  in Multi-Agent Systems
                </span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-[#000000]">Paper</span>
                <div>
                  <a href="#" className="text-blue-600 hover:underline">
                    MyPaper.pdf
                  </a>
                  <span className="text-[#64748b] ml-2">[Sep 17, 21:54]</span>
                </div>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-[#000000]">Area/Track</span>
                <span className="text-[#000000]">
                  Artificial Intelligence and Cognitive Systems
                </span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-[#000000]">Keywords</span>
                <span className="text-[#000000]">
                  Neuro-symbolic AI, zero-shot learning, commonsense reasoning,
                  multi-agent systems, cognitive architectures
                </span>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-[#000000]">Abstract</span>
                <p className="text-[#000000] leading-relaxed">
                  This paper introduces a novel neuro-symbolic framework for
                  enabling zero-shot commonsense reasoning in multi-agent
                  environments. While existing systems either rely on
                  statistical learning or symbolic reasoning, our approach
                  combines both by integrating a large language model with a
                  structured knowledge base to facilitate efficient inference
                  and generalization in unfamiliar scenarios. We evaluate the
                  framework on a custom benchmark involving collaborative
                  planning and navigation tasks across heterogeneous agents.
                  Results show a significant improvement in both task completion
                  rate and reasoning accuracy compared to baseline methods. The
                  proposed method highlights the potential of hybrid cognitive
                  architectures in achieving robust and adaptive behavior in
                  complex, real-world domains.
                </p>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-4">
                <span className="font-medium text-[#000000]">Submitted</span>
                <span className="text-[#000000]">Sep 17, 13:42</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authors Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#000000] mb-4">Authors</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#f1f5f9]">
                    <tr>
                      <th className="text-left p-4 font-medium text-[#000000]">
                        First Name
                      </th>
                      <th className="text-left p-4 font-medium text-[#000000]">
                        Last Name
                      </th>
                      <th className="text-left p-4 font-medium text-[#000000]">
                        Email
                      </th>
                      <th className="text-left p-4 font-medium text-[#000000]">
                        Country
                      </th>
                      <th className="text-left p-4 font-medium text-[#000000]">
                        Affiliation
                      </th>
                      <th className="text-left p-4 font-medium text-[#000000]">
                        Corresponding?
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="p-4 text-[#000000]">Mohammed</td>
                      <td className="p-4 text-[#000000]">Su</td>
                      <td className="p-4 text-[#000000]">Medsu@gmail.com</td>
                      <td className="p-4 text-[#000000]">Morocco</td>
                      <td className="p-4 text-[#000000]">
                        Laboratory of Whatever, National School of Something,
                        NSS
                      </td>
                      <td className="p-4 text-[#000000]">Yes</td>
                    </tr>
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="p-4 text-[#000000]">Achraf</td>
                      <td className="p-4 text-[#000000]">Tahiri</td>
                      <td className="p-4 text-[#000000]">chrafiri@gmail.com</td>
                      <td className="p-4 text-[#000000]">Morocco</td>
                      <td className="p-4 text-[#000000]">
                        Laboratory of Whatever, National School of Something,
                        NSS
                      </td>
                      <td className="p-4 text-[#000000]">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[#000000]">Mohammed</td>
                      <td className="p-4 text-[#000000]">Alami</td>
                      <td className="p-4 text-[#000000]">m.alami@nss.ma</td>
                      <td className="p-4 text-[#000000]">Morocco</td>
                      <td className="p-4 text-[#000000]">
                        Laboratory of Whatever, National School of Something,
                        NSS
                      </td>
                      <td className="p-4 text-[#000000]">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Review Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#000000] mb-4">
            Your Review
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <span className="font-medium text-[#000000]">
                    Acceptance Status
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit bg-[#f1f5f9] text-[#64748b]"
                  >
                    Weak Accept
                  </Badge>
                </div>

                <div className="grid grid-cols-[160px_1fr] gap-4">
                  <span className="font-medium text-[#000000]">
                    Overall Evaluation
                  </span>
                  <p className="text-[#000000] leading-relaxed">
                    This paper introduces a novel neuro-symbolic framework for
                    enabling zero-shot commonsense reasoning in multi-agent
                    environments. While existing systems either rely on
                    statistical learning or symbolic reasoning, our approach
                    combines both by integrating a large language model with a
                    structured knowledge base to facilitate efficient inference
                    and generalization in unfamiliar scenarios. We evaluate the
                    framework on a custom benchmark involving collaborative
                    planning and navigation tasks across heterogeneous agents.
                    Results show a significant improvement in both task
                    completion rate and reasoning accuracy compared to baseline
                    methods. The proposed method highlights the potential of
                    hybrid cognitive architectures in achieving robust and
                    adaptive behavior in complex, real-world domains.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Review Button */}
        <div className="flex justify-end">
          <Button className="bg-[#0f172a] text-white hover:bg-[#0f172a]/90 px-8">
            Edit Review
          </Button>
        </div>
      </main>
    </div>
  );
}
